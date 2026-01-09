import { Injectable } from '@nestjs/common';

/**
 * Maximum Win Limit Service
 * Manages configurable win caps per operator
 */
@Injectable()
export class MaxWinLimitService {
  /**
   * Apply maximum win limit to a win amount
   * @param winAmount Calculated win amount
   * @param maxWinLimit Maximum allowed win (from operator config)
   * @returns Final win amount after applying limit
   */
  applyMaxWinLimit(winAmount: number, maxWinLimit?: number): number {
    if (!maxWinLimit || winAmount <= maxWinLimit) {
      return winAmount;
    }

    return maxWinLimit;
  }

  /**
   * Check if a potential win would exceed the limit
   */
  wouldExceedLimit(
    stake: number,
    multiplier: number,
    maxWinLimit?: number,
  ): boolean {
    if (!maxWinLimit) {
      return false;
    }

    const potentialWin = stake * multiplier;
    return potentialWin > maxWinLimit;
  }

  /**
   * Get effective multiplier after applying max win limit
   */
  getEffectiveMultiplier(
    stake: number,
    baseMultiplier: number,
    maxWinLimit?: number,
  ): number {
    if (!maxWinLimit) {
      return baseMultiplier;
    }

    const baseWin = stake * baseMultiplier;
    if (baseWin <= maxWinLimit) {
      return baseMultiplier;
    }

    return maxWinLimit / stake;
  }
}
