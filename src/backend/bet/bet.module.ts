import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bet } from '../database/entities/bet.entity';
import { BetService } from './services/bet.service';
import { BetController } from './controllers/bet.controller';
import { WalletModule } from '../wallet/wallet.module';
import { OperatorModule } from '../operator/operator.module';
import { RoundModule } from '../round/round.module';
import { PayoutModule } from '../payout/payout.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bet]),
    WalletModule,
    OperatorModule,
    RoundModule,
    PayoutModule,
  ],
  controllers: [BetController],
  providers: [BetService],
  exports: [BetService],
})
export class BetModule {}
