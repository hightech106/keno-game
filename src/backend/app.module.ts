import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEngineModule } from './game-engine/game-engine.module';
import { RoundModule } from './round/round.module';
import { PayoutModule } from './payout/payout.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { DatabaseModule } from './database/database.module';
import { OperatorModule } from './operator/operator.module';
import { WalletModule } from './wallet/wallet.module';
import { BetModule } from './bet/bet.module';
import { GatewayModule } from './gateway/gateway.module';
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
    
    // Business Logic Modules
    OperatorModule,
    WalletModule,
    BetModule,
    
    // WebSocket Gateway
    GatewayModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
