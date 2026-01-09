import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './controllers/admin.controller';
import { Round } from '../database/entities/round.entity';
import { Bet } from '../database/entities/bet.entity';
import { RoundModule } from '../round/round.module';
import { BetModule } from '../bet/bet.module';
import { OperatorModule } from '../operator/operator.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Round, Bet]),
    RoundModule,
    BetModule,
    OperatorModule,
    AuthModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
