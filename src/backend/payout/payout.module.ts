import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bet } from '../database/entities/bet.entity';
import { PayoutTableService } from './services/payout-table.service';
import { PayoutCalculationService } from './services/payout-calculation.service';
import { MaxWinLimitService } from './services/max-win-limit.service';
import { SettlementService } from './services/settlement.service';
import { GameEngineModule } from '../game-engine/game-engine.module';
import { WalletModule } from '../wallet/wallet.module';
import { OperatorModule } from '../operator/operator.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bet]),
    GameEngineModule,
    WalletModule,
    OperatorModule,
  ],
  providers: [
    PayoutTableService,
    PayoutCalculationService,
    MaxWinLimitService,
    SettlementService,
  ],
  exports: [
    PayoutTableService,
    PayoutCalculationService,
    MaxWinLimitService,
    SettlementService,
  ],
})
export class PayoutModule {}
