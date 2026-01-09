import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEngineModule } from './game-engine/game-engine.module';
import { RoundModule } from './round/round.module';
import { PayoutModule } from './payout/payout.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { DatabaseModule } from './database/database.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Scheduling for automatic rounds
    ScheduleModule.forRoot(),
    
    // Database
    DatabaseModule,
    
    // Core game modules
    GameEngineModule,
    RoundModule,
    PayoutModule,
    SchedulerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
