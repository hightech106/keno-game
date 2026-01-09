import { Injectable } from '@nestjs/common';

/**
 * Number Draw Engine
 * Generates 20 unique random numbers from the pool of 1-80
 */
@Injectable()
export class NumberDrawService {
  private readonly MIN_NUMBER = 1;
  private readonly MAX_NUMBER = 80;
  private readonly DRAW_COUNT = 20;

  /**
   * Generate 20 unique random numbers from 1-80
   * @param seed Optional seed for deterministic generation (for testing/fairness)
   * @returns Array of 20 unique numbers, sorted ascending
   */
  generateDrawNumbers(seed?: string): number[] {
    const numbers: number[] = [];
    const availableNumbers = Array.from(
      { length: this.MAX_NUMBER },
      (_, i) => i + this.MIN_NUMBER,
    );

    // Use seed if provided for deterministic generation
    let randomFunction: () => number;
    if (seed) {
      randomFunction = this.seededRandom(seed);
    } else {
      randomFunction = Math.random.bind(Math);
    }

    // Draw 20 unique numbers
    for (let i = 0; i < this.DRAW_COUNT; i++) {
      const randomIndex = Math.floor(
        randomFunction() * availableNumbers.length,
      );
      const selectedNumber = availableNumbers.splice(randomIndex, 1)[0];
      numbers.push(selectedNumber);
    }

    // Return sorted for consistency
    return numbers.sort((a, b) => a - b);
  }

  /**
   * Validate that numbers are valid (1-80, unique, exactly 20)
   */
  validateDrawNumbers(numbers: number[]): boolean {
    if (numbers.length !== this.DRAW_COUNT) {
      return false;
    }

    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== this.DRAW_COUNT) {
      return false; // Duplicates found
    }

    return numbers.every(
      (num) => num >= this.MIN_NUMBER && num <= this.MAX_NUMBER,
    );
  }

  /**
   * Seeded random number generator for provably fair systems
   * This will be enhanced in Phase 2 with commit-reveal scheme
   */
  private seededRandom(seed: string): () => number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    let state = Math.abs(hash);
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }
}
