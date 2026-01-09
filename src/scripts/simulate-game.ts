/**
 * Local Game Simulation Script
 * Tests core game logic without database
 * 
 * Run with: npx ts-node src/scripts/simulate-game.ts
 */

import { NumberDrawService } from '../backend/game-engine/services/number-draw.service';
import { HitDetectionService } from '../backend/game-engine/services/hit-detection.service';
import { PayoutTableService } from '../backend/payout/services/payout-table.service';
import { PayoutCalculationService } from '../backend/payout/services/payout-calculation.service';
import { MaxWinLimitService } from '../backend/payout/services/max-win-limit.service';

function simulateGame() {
  console.log('🎰 Keno Game Simulation\n');
  console.log('='.repeat(50));

  // Initialize services
  const numberDrawService = new NumberDrawService();
  const hitDetectionService = new HitDetectionService();
  const payoutTableService = new PayoutTableService();
  const maxWinLimitService = new MaxWinLimitService();
  const payoutCalculationService = new PayoutCalculationService(
    payoutTableService,
    maxWinLimitService,
  );

  // Simulate a round
  console.log('\n📊 Simulating Round...\n');

  // Player selections
  const playerSelections = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45];
  const stake = 10.0;

  console.log(`Player Selection: ${playerSelections.join(', ')}`);
  console.log(`Pick Count: ${playerSelections.length}`);
  console.log(`Stake: $${stake.toFixed(2)}\n`);

  // Generate draw
  const drawnNumbers = numberDrawService.generateDrawNumbers();
  console.log(`Drawn Numbers: ${drawnNumbers.join(', ')}\n`);

  // Calculate hits
  const hits = hitDetectionService.calculateHits(
    playerSelections,
    drawnNumbers,
  );
  const matchedNumbers = hitDetectionService.getMatchedNumbers(
    playerSelections,
    drawnNumbers,
  );

  console.log(`Hits: ${hits}`);
  console.log(`Matched Numbers: ${matchedNumbers.length > 0 ? matchedNumbers.join(', ') : 'None'}\n`);

  // Calculate payout
  const payoutResult = payoutCalculationService.calculatePayout(
    playerSelections.length,
    hits,
    stake,
  );

  console.log('💰 Payout Calculation:');
  console.log(`  Multiplier: ${payoutResult.multiplier}x`);
  console.log(`  Base Win Amount: $${payoutResult.baseWinAmount.toFixed(2)}`);
  console.log(`  Final Win Amount: $${payoutResult.winAmount.toFixed(2)}`);
  console.log(`  Max Win Cap Applied: ${payoutResult.maxWinCapApplied ? 'Yes' : 'No'}`);
  console.log(`  Result: ${payoutResult.isWin ? 'WIN 🎉' : 'LOSS'}\n`);

  // Show payout table for this pick
  console.log('📋 Payout Table for Pick 10:');
  const payoutTable = payoutTableService.getPayoutTableForPick(10);
  Object.entries(payoutTable)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([hitsStr, multiplier]) => {
      const hitsNum = Number(hitsStr);
      const winAmount = stake * multiplier;
      const marker = hitsNum === hits ? ' ←' : '';
      console.log(`  ${hitsNum} hit(s): ${multiplier}x = $${winAmount.toFixed(2)}${marker}`);
    });

  console.log('\n' + '='.repeat(50));
  console.log('✅ Simulation Complete\n');
}

// Run simulation
simulateGame();
