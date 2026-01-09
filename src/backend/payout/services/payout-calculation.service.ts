import { Injectable } from '@nestjs/common';
import { PayoutTableService } from './payout-table.service';
import { MaxWinLimitService } from './max-win-limit.service';

export interface PayoutCalculationResult {
  hits: number;
  multiplier: number;
  baseWinAmount: number; // Before max win limit
  winAmount: number; // After max win limit
  maxWinCapApplied: boolean;
  isWin: boolean;
}

/**
 * Payout Calculation Service
 * Calculates winnings based on hits, stake, and payout tables
 */
@Injectable()
export class PayoutCalculationService {
  constructor(
    private readonly payoutTableService: PayoutTableService,
    private readonly maxWinLimitService: MaxWinLimitService,
  ) {}

  /**
   * Calculate payout for a bet
   * @param pickCount Number of numbers selected (1-10)
   * @param hits Number of matches
   * @param stake Bet amount
   * @param maxWinLimit Optional maximum win limit (from operator config)
   * @returns Payout calculation result
   */
  calculatePayout(
    pickCount: number,
    hits: number,
    stake: number,
    maxWinLimit?: number,
  ): PayoutCalculationResult {
    // Get multiplier from payout table
    const multiplier = this.payoutTableService.getMultiplier(pickCount, hits);
    const isWin = multiplier > 0;

    // Calculate base win amount
    const baseWinAmount = stake * multiplier;

    // Apply max win limit if configured
    let winAmount = baseWinAmount;
    let maxWinCapApplied = false;

    if (maxWinLimit && baseWinAmount > maxWinLimit) {
      winAmount = maxWinLimit;
      maxWinCapApplied = true;
    }

    return {
      hits,
      multiplier,
      baseWinAmount,
      winAmount,
      maxWinCapApplied,
      isWin,
    };
  }

  /**
   * Calculate potential payout before placing bet
   * Useful for displaying potential winnings
   */
  calculatePotentialPayout(
    pickCount: number,
    stake: number,
    maxWinLimit?: number,
  ): Record<number, number> {
    const potentialPayouts: Record<number, number> = {};

    // Calculate payout for all possible hit counts
    for (let hits = 0; hits <= pickCount; hits++) {
      const multiplier = this.payoutTableService.getMultiplier(pickCount, hits);
      let winAmount = stake * multiplier;

      if (maxWinLimit && winAmount > maxWinLimit) {
        winAmount = maxWinLimit;
      }

      potentialPayouts[hits] = winAmount;
    }

    return potentialPayouts;
  }
}
