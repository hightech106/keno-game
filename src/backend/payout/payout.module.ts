import { Module } from '@nestjs/common';
import { PayoutTableService } from './services/payout-table.service';
import { PayoutCalculationService } from './services/payout-calculation.service';
import { MaxWinLimitService } from './services/max-win-limit.service';

@Module({
  providers: [
    PayoutTableService,
    PayoutCalculationService,
    MaxWinLimitService,
  ],
  exports: [
    PayoutTableService,
    PayoutCalculationService,
    MaxWinLimitService,
  ],
})
export class PayoutModule {}
