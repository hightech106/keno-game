import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from '../../database/entities/bet.entity';
import { Round } from '../../database/entities/round.entity';
import { PayoutCalculationService } from './payout-calculation.service';
import { HitDetectionService } from '../../game-engine/services/hit-detection.service';
import { WalletProvider } from '../../wallet/interfaces/wallet-provider.interface';
import { OperatorService } from '../../operator/services/operator.service';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,
    private readonly payoutCalcService: PayoutCalculationService,
    private readonly hitDetectionService: HitDetectionService,
    @Inject('WALLET_PROVIDER')
    private readonly walletProvider: WalletProvider,
    private readonly operatorService: OperatorService,
  ) {}

  async settleRound(round: Round): Promise<void> {
    this.logger.log(`Starting settlement for Round ${round.roundId}`);
    
    if (!round.numbersDrawn || round.numbersDrawn.length === 0) {
      this.logger.error(`Round ${round.roundId} has no drawn numbers! Cannot settle.`);
      return;
    }

    // Process in chunks/batches in production, but for now we fetch all
    // Get all bets for this round that haven't been credited yet
    const bets = await this.betRepository.find({
      where: { 
        roundId: round.roundId,
        credited: false,
      },
    });

    this.logger.log(`Found ${bets.length} pending bets for Round ${round.roundId}`);

    for (const bet of bets) {
      await this.processBet(bet, round.numbersDrawn);
    }

    this.logger.log(`Settlement completed for Round ${round.roundId}`);
  }

  private async processBet(bet: Bet, drawnNumbers: number[]): Promise<void> {
    try {
      // 1. Calculate Hits
      const hitCount = this.hitDetectionService.calculateHits(bet.numbersSelected, drawnNumbers);

      // 2. Get operator config for max win limit
      const config = await this.operatorService.getConfig(bet.operatorId);
      
      // 3. Calculate Payout
      const payoutResult = this.payoutCalcService.calculatePayout(
        bet.selectionCount,
        hitCount,
        bet.betAmount,
        config.maxWinPerTicket,
      );

      // 4. Update Bet State
      bet.hitsCount = hitCount;
      bet.payoutMultiplier = payoutResult.multiplier;
      bet.winAmount = payoutResult.winAmount;
      bet.maxWinCapApplied = payoutResult.maxWinCapApplied;
      bet.credited = payoutResult.isWin && payoutResult.winAmount > 0;

      await this.betRepository.save(bet);

      // 5. Credit Wallet (if won)
      if (payoutResult.isWin && payoutResult.winAmount > 0) {
        // Get currency from operator
        const operator = await this.operatorService.getOperator(bet.operatorId);
        const currency = operator.defaultCurrency;
        
        await this.walletProvider.credit(
          bet.playerId,
          payoutResult.winAmount,
          currency,
          `WIN-${bet.betId}`
        );
        this.logger.debug(`Credited ${payoutResult.winAmount} ${currency} to ${bet.playerId} for bet ${bet.betId}`);
      }

    } catch (error) {
      this.logger.error(`Failed to process bet ${bet.betId}: ${error.message}`, error.stack);
    }
  }
}
