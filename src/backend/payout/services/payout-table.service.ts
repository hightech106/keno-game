import { Injectable } from '@nestjs/common';

/**
 * Payout Table Service
 * Manages payout multipliers for all pick types (1-10)
 * Based on the payout table from documentation
 */
@Injectable()
export class PayoutTableService {
  // Payout tables: pickCount -> hits -> multiplier
  private readonly payoutTables: Record<number, Record<number, number>> = {
    1: {
      0: 0,
      1: 3.9,
    },
    2: {
      0: 0,
      1: 1.5,
      2: 12,
    },
    3: {
      0: 0,
      1: 1,
      2: 3,
      3: 45,
    },
    4: {
      0: 0,
      1: 0,
      2: 1.5,
      3: 5,
      4: 120,
    },
    5: {
      0: 0,
      1: 0,
      2: 1,
      3: 3,
      4: 15,
      5: 800,
    },
    6: {
      0: 0,
      3: 2,
      4: 7,
      5: 50,
      6: 1600,
    },
    7: {
      0: 0,
      3: 1,
      4: 3,
      5: 20,
      6: 300,
      7: 5000,
    },
    8: {
      0: 0,
      4: 2,
      5: 6,
      6: 100,
      7: 1500,
      8: 10000,
    },
    9: {
      0: 0,
      4: 1,
      5: 3,
      6: 30,
      7: 400,
      8: 4000,
      9: 10000,
    },
    10: {
      0: 0,
      5: 2,
      6: 10,
      7: 100,
      8: 2000,
      9: 6000,
      10: 10000,
    },
  };

  /**
   * Get payout multiplier for given pick count and hits
   * @param pickCount Number of numbers selected (1-10)
   * @param hits Number of matches
   * @returns Multiplier (0 if no win)
   */
  getMultiplier(pickCount: number, hits: number): number {
    if (pickCount < 1 || pickCount > 10) {
      throw new Error(`Invalid pick count: ${pickCount}. Must be 1-10.`);
    }

    if (hits < 0 || hits > pickCount) {
      throw new Error(
        `Invalid hits: ${hits}. Must be between 0 and ${pickCount}.`,
      );
    }

    const table = this.payoutTables[pickCount];
    if (!table) {
      throw new Error(`No payout table found for pick count: ${pickCount}`);
    }

    // Return multiplier or 0 if not in table (no win)
    return table[hits] ?? 0;
  }

  /**
   * Check if a hit count results in a win for given pick count
   */
  isWinning(pickCount: number, hits: number): boolean {
    return this.getMultiplier(pickCount, hits) > 0;
  }

  /**
   * Get all payout multipliers for a pick count (for display purposes)
   */
  getPayoutTableForPick(pickCount: number): Record<number, number> {
    if (pickCount < 1 || pickCount > 10) {
      throw new Error(`Invalid pick count: ${pickCount}. Must be 1-10.`);
    }

    return { ...this.payoutTables[pickCount] };
  }

  /**
   * Validate payout table integrity
   */
  validatePayoutTables(): boolean {
    // Ensure all pick counts 1-10 exist
    for (let i = 1; i <= 10; i++) {
      if (!this.payoutTables[i]) {
        return false;
      }
    }
    return true;
  }
}
