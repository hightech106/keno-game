/**
 * Keno Game Simulation Script
 * Runs a massive number of rounds to verify RTP (Return to Player) and Hit Frequencies.
 * 
 * Run with: npx ts-node src/scripts/simulate-game.ts [numRounds]
 */

import { NumberDrawService } from '../backend/game-engine/services/number-draw.service';
import { HitDetectionService } from '../backend/game-engine/services/hit-detection.service';
import { PayoutTableService } from '../backend/payout/services/payout-table.service';
import { PayoutCalculationService } from '../backend/payout/services/payout-calculation.service';
import { MaxWinLimitService } from '../backend/payout/services/max-win-limit.service';

class GameSimulator {
  private numberDrawService: NumberDrawService;
  private hitDetectionService: HitDetectionService;
  private payoutCalculationService: PayoutCalculationService;

  constructor() {
    this.numberDrawService = new NumberDrawService();
    this.hitDetectionService = new HitDetectionService();
    const payoutTableService = new PayoutTableService();
    const maxWinLimitService = new MaxWinLimitService();
    this.payoutCalculationService = new PayoutCalculationService(
      payoutTableService,
      maxWinLimitService
    );
  }

  /**
   * Generates a random set of unique numbers (1-80) for a player bet.
   */
  private generateRandomSelection(count: number): number[] {
    const selection = new Set<number>();
    while (selection.size < count) {
      selection.add(Math.floor(Math.random() * 80) + 1);
    }
    return Array.from(selection);
  }

  public runSimulation(numRounds: number = 10000) {
    console.log(`\n🚀 Starting Simulation of ${numRounds.toLocaleString()} rounds...`);
    console.log('='.repeat(60));

    const startTime = Date.now();
    
    // Stats
    let totalWagered = 0;
    let totalWon = 0;
    const hitDistribution: Record<number, number> = {};
    const winDistribution: Record<number, number> = {};
    let maxWin = 0;

    // Simulation Config
    const pickCount = 10; // Standard 10-spot game
    const stake = 1.0;    // $1 bet per round

    for (let i = 0; i < numRounds; i++) {
      // 1. Place Bet
      const playerSelections = this.generateRandomSelection(pickCount);
      totalWagered += stake;

      // 2. Draw Numbers
      const drawnNumbers = this.numberDrawService.generateDrawNumbers();

      // 3. Calculate Hits
      const hits = this.hitDetectionService.calculateHits(playerSelections, drawnNumbers);
      
      // Track hit distribution
      hitDistribution[hits] = (hitDistribution[hits] || 0) + 1;

      // 4. Calculate Payout
      const payout = this.payoutCalculationService.calculatePayout(
        pickCount,
        hits,
        stake
      );

      totalWon += payout.winAmount;

      if (payout.winAmount > 0) {
        winDistribution[hits] = (winDistribution[hits] || 0) + 1;
        if (payout.winAmount > maxWin) {
          maxWin = payout.winAmount;
        }
      }

      // Progress log
      if (i > 0 && i % (numRounds / 10) === 0) {
        process.stdout.write(`.`);
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    const rtp = (totalWon / totalWagered) * 100;
    const houseEdge = 100 - rtp;

    console.log('\n\n📊 SIMULATION RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Rounds:      ${numRounds.toLocaleString()}`);
    console.log(`Duration:          ${duration.toFixed(2)}s`);
    console.log(`Pick Count:        ${pickCount}`);
    console.log(`Stake per Round:   $${stake.toFixed(2)}`);
    console.log(`Total Wagered:     $${totalWagered.toFixed(2)}`);
    console.log(`Total Won:         $${totalWon.toFixed(2)}`);
    console.log(`Largest Win:       $${maxWin.toFixed(2)}`);
    console.log('-'.repeat(60));
    console.log(`RTP (Return):      ${rtp.toFixed(4)}%  <-- Target: 92-98%`);
    console.log(`House Edge:        ${houseEdge.toFixed(4)}%`);
    console.log('='.repeat(60));
    
    console.log('\n🎯 HIT FREQUENCY DISTRIBUTION');
    console.log('Hits\tCount\t\tFreq (%)\tWin Amount');
    console.log('-'.repeat(60));
    
    for (let h = 0; h <= pickCount; h++) {
      const count = hitDistribution[h] || 0;
      const freq = (count / numRounds) * 100;
      const payout = this.payoutCalculationService.calculatePayout(pickCount, h, stake);
      const isWin = payout.winAmount > 0 ? '💰' : '';
      
      console.log(`${h}\t${count.toLocaleString()}\t\t${freq.toFixed(4)}%\t$${payout.winAmount.toFixed(2)} ${isWin}`);
    }
  }
}

// Parse args
const args = process.argv.slice(2);
const rounds = args[0] ? parseInt(args[0], 10) : 100000;

const simulator = new GameSimulator();
simulator.runSimulation(rounds);
