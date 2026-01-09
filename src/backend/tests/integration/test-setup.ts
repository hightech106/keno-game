import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';

/**
 * Integration Test Setup
 * 
 * Creates a test module with in-memory database for integration testing
 */
export async function createTestModule(
  builderCallback?: (builder: any) => void
): Promise<TestingModule> {
  const builder = Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: ['.env.test', '.env'],
      }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.TEST_DB_HOST || 'localhost',
        port: parseInt(process.env.TEST_DB_PORT || '5432'),
        username: process.env.TEST_DB_USER || 'postgres',
        password: process.env.TEST_DB_PASSWORD || 'postgres',
        database: process.env.TEST_DB_NAME || 'keno_test',
        entities: [
          __dirname + '/../../database/entities/*.entity{.ts,.js}',
        ],
        synchronize: true, // Auto-create schema for tests
        dropSchema: true, // Drop schema before each test run
        logging: false, // Disable logging in tests
      }),
      AppModule,
    ],
  });

  if (builderCallback) {
    builderCallback(builder);
  }

  const module: TestingModule = await builder.compile();

  return module;
}

/**
 * Clean up test database
 */
export async function cleanupTestDatabase(dataSource: DataSource): Promise<void> {
  const entities = dataSource.entityMetadatas;
  
  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.clear();
  }
}

/**
 * Close test module and cleanup
 */
export async function closeTestModule(module: TestingModule): Promise<void> {
  const dataSource = module.get(DataSource);
  await cleanupTestDatabase(dataSource);
  await dataSource.destroy();
  await module.close();
}
