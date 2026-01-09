import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
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
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { AdminModule } from './admin/admin.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Common utilities (audit logging, etc.)
    CommonModule,
    
    // Scheduling for automatic rounds
    ScheduleModule.forRoot(),
    
    // Database
    DatabaseModule,
    
    // Authentication
    AuthModule,
    
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
    
    // Admin Module
    AdminModule,
  ],
  controllers: [],
  providers: [
    // Apply JWT guard globally (can be bypassed with @Public() decorator)
    // Comment out for development mode, uncomment for production
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule {}
