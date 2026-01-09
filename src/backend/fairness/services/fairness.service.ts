import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class FairnessService {
  private readonly MAX_NUMBER = 80;
  private readonly DRAW_COUNT = 20;

  /**
   * Generates a cryptographically secure random server seed
   */
  generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hashes the server seed for public display (Commit)
   */
  hashServerSeed(serverSeed: string): string {
    return crypto.createHash('sha256').update(serverSeed).digest('hex');
  }

  /**
   * Generates Keno numbers using HMAC-SHA256 (Proved Fair)
   * 
   * Algorithm:
   * 1. HMAC-SHA256(serverSeed, clientSeed + nonce)
   * 2. Take 4 bytes at a time, convert to integer
   * 3. Map to 1-80 range
   * 4. Keep if unique, discard if duplicate
   * 5. Repeat until 20 unique numbers found
   */
  generateDraw(serverSeed: string, clientSeed: string, nonce: number): number[] {
    const message = `${clientSeed}:${nonce}`;
    let currentRound = 0;
    const numbers = new Set<number>();
    
    while (numbers.size < this.DRAW_COUNT) {
      const hmac = crypto.createHmac('sha256', serverSeed);
      hmac.update(`${message}:${currentRound}`);
      const hash = hmac.digest('hex');
      
      // Process the hash in 4-byte chunks
      for (let i = 0; i < hash.length; i += 8) {
        if (numbers.size >= this.DRAW_COUNT) break;
        
        const chunk = hash.substring(i, i + 8);
        const decimalValue = parseInt(chunk, 16);
        
        // Map to 1-80
        // We use the remainder operator, but to be strictly uniform we should discard
        // values that would cause modulo bias. However, 2^32 is large enough that bias is negligible for range 80.
        const number = (decimalValue % this.MAX_NUMBER) + 1;
        
        numbers.add(number);
      }
      
      currentRound++;
    }

    return Array.from(numbers).sort((a, b) => a - b);
  }

  /**
   * Verify a past draw
   */
  verifyDraw(serverSeed: string, clientSeed: string, nonce: number, drawnNumbers: number[]): boolean {
    const calculatedNumbers = this.generateDraw(serverSeed, clientSeed, nonce);
    
    if (drawnNumbers.length !== calculatedNumbers.length) return false;
    
    for (let i = 0; i < drawnNumbers.length; i++) {
      if (drawnNumbers[i] !== calculatedNumbers[i]) return false;
    }
    
    return true;
  }
}
