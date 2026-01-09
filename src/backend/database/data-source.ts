import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';
import { Round } from './entities/round.entity';
import { Bet } from './entities/bet.entity';
import { Operator } from './entities/operator.entity';
import { OperatorConfig } from './entities/operator-config.entity';

// Load environment variables
config({ path: join(__dirname, '../../..', '.env') });
config({ path: join(__dirname, '../../..', '.env.local') });

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'Pwldud0828!'),
  database: configService.get('DB_NAME', 'keno_game'),
  entities: [Round, Bet, Operator, OperatorConfig],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false, // Never use synchronize in production
  logging: configService.get('NODE_ENV') === 'development',
});
