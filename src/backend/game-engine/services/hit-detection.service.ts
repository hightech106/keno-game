import { Injectable } from '@nestjs/common';

/**
 * Hit Detection Service
 * Calculates matching numbers between player selections and drawn numbers
 */
@Injectable()
export class HitDetectionService {
  /**
   * Calculate number of matches between player selections and drawn numbers
   * @param playerNumbers Player's selected numbers (1-10 numbers, range 1-80)
   * @param drawnNumbers House drawn numbers (20 numbers, range 1-80)
   * @returns Number of matches (hits)
   */
  calculateHits(
    playerNumbers: number[],
    drawnNumbers: number[],
  ): number {
    if (!this.validateSelections(playerNumbers)) {
      throw new Error('Invalid player number selection');
    }

    if (!this.validateDrawNumbers(drawnNumbers)) {
      throw new Error('Invalid drawn numbers');
    }

    // Convert to Sets for efficient intersection
    const playerSet = new Set(playerNumbers);
    const drawnSet = new Set(drawnNumbers);

    // Count matches
    let hits = 0;
    for (const num of playerSet) {
      if (drawnSet.has(num)) {
        hits++;
      }
    }

    return hits;
  }

  /**
   * Validate player number selection
   * Rules: 1-10 numbers, range 1-80, no duplicates
   */
  validateSelections(numbers: number[]): boolean {
    // Must select 1-10 numbers
    if (numbers.length < 1 || numbers.length > 10) {
      return false;
    }

    // Must be unique
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      return false;
    }

    // All numbers must be in range 1-80
    return numbers.every((num) => num >= 1 && num <= 80);
  }

  /**
   * Validate drawn numbers
   */
  private validateDrawNumbers(numbers: number[]): boolean {
    if (numbers.length !== 20) {
      return false;
    }

    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== 20) {
      return false;
    }

    return numbers.every((num) => num >= 1 && num <= 80);
  }

  /**
   * Get matched numbers (for display purposes)
   */
  getMatchedNumbers(
    playerNumbers: number[],
    drawnNumbers: number[],
  ): number[] {
    const playerSet = new Set(playerNumbers);
    const drawnSet = new Set(drawnNumbers);

    const matches: number[] = [];
    for (const num of playerSet) {
      if (drawnSet.has(num)) {
        matches.push(num);
      }
    }

    return matches.sort((a, b) => a - b);
  }
}
