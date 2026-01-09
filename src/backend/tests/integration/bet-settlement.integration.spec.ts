import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { RoundService } from '../../round/services/round.service';
import { BetService } from '../../bet/services/bet.service';
import { SettlementService } from '../../payout/services/settlement.service';
import { RoundStatus } from '../../common/enums/round-status.enum';
import { Bet } from '../../database/entities/bet.entity';
import { Round } from '../../database/entities/round.entity';
import { Operator } from '../../database/entities/operator.entity';
import { OperatorConfig } from '../../database/entities/operator-config.entity';
import { createTestModule, closeTestModule } from './test-setup';

describe('Bet Placement and Settlement Integration', () => {
  let module: TestingModule;
  let roundService: RoundService;
  let betService: BetService;
  let settlementService: SettlementService;
  let dataSource: DataSource;
  let testOperator: Operator;
  let testConfig: OperatorConfig;

  beforeAll(async () => {
    module = await createTestModule();
    roundService = module.get<RoundService>(RoundService);
    betService = module.get<BetService>(BetService);
    settlementService = module.get<SettlementService>(SettlementService);
    dataSource = module.get<DataSource>(DataSource);

    // Create test operator and config
    const operatorRepo = dataSource.getRepository(Operator);
    const configRepo = dataSource.getRepository(OperatorConfig);

    // Check if operator already exists
    let existingOperator = await operatorRepo.findOne({ where: { operatorId: 'test-op-1' } });
    if (!existingOperator) {
      testOperator = operatorRepo.create({
        operatorId: 'test-op-1',
        name: 'Test Operator',
        status: 'active',
        defaultCurrency: 'USD',
      });
      testOperator = await operatorRepo.save(testOperator);
    } else {
      testOperator = existingOperator;
    }

    // Check if config already exists
    let existingConfig = await configRepo.findOne({ where: { operatorId: 'test-op-1' } });
    if (!existingConfig) {
      testConfig = configRepo.create({
        operatorId: 'test-op-1',
        minBet: 1,
        maxBet: 1000,
        maxWinPerTicket: 10000,
        enabled: true,
      });
      testConfig = await configRepo.save(testConfig);
    } else {
      testConfig = existingConfig;
    }
  });

  afterAll(async () => {
    await closeTestModule(module);
  });

  beforeEach(async () => {
    // Clean database before each test
    await dataSource.query('TRUNCATE TABLE bets CASCADE');
    await dataSource.query('TRUNCATE TABLE rounds CASCADE');
  });

  describe('Complete Bet Flow', () => {
    it('should place bet, draw numbers, and settle correctly', async () => {
      // 1. Create and open a round
      const round = await roundService.createRound(new Date());
      expect(round.status).toBe(RoundStatus.OPEN);

      // 2. Place a bet
      const betDto = {
        operatorId: 'test-op-1',
        playerId: 'test-player-1',
        currency: 'USD',
        stake: 10,
        selections: [1, 2, 3, 4, 5],
      };

      const bet = await betService.placeBet(betDto);
      expect(bet).toBeDefined();
      expect(bet.betId).toBeDefined();
      expect(bet.betAmount).toBe(10);
      expect(bet.numbersSelected).toEqual([1, 2, 3, 4, 5]);
      expect(bet.credited).toBe(false);

      // 3. Transition round to DRAWING (generates numbers)
      await roundService.transitionRound(round.roundId, RoundStatus.CLOSING);
      const drawingRound = await roundService.transitionRound(round.roundId, RoundStatus.DRAWING);
      expect(drawingRound.numbersDrawn).toBeDefined();
      expect(drawingRound.numbersDrawn.length).toBe(20);

      // 4. Transition to SETTLING (should process bets)
      const settlingRound = await roundService.transitionRound(round.roundId, RoundStatus.SETTLING);
      expect(settlingRound.status).toBe(RoundStatus.SETTLING);

      // 5. Check bet was settled
      const settledBet = await betService.getBetById(bet.betId);
      expect(settledBet).toBeDefined();
      expect(settledBet.hitsCount).toBeDefined();
      expect(settledBet.hitsCount).toBeGreaterThanOrEqual(0);
      expect(settledBet.hitsCount).toBeLessThanOrEqual(5);

      // If there are hits, check payout
      if (settledBet.hitsCount > 0) {
        expect(settledBet.payoutMultiplier).toBeDefined();
        expect(settledBet.winAmount).toBeDefined();
      }
    });

    it('should calculate correct hits and payouts', async () => {
      const round = await roundService.createRound(new Date());

      // Place bet with specific numbers
      const bet = await betService.placeBet({
        operatorId: 'test-op-1',
        playerId: 'test-player-1',
        currency: 'USD',
        stake: 10,
        selections: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      });

      // Manually set drawn numbers to test specific scenarios
      await roundService.transitionRound(round.roundId, RoundStatus.CLOSING);
      const drawingRound = await roundService.transitionRound(round.roundId, RoundStatus.DRAWING);

      // Manually settle to check calculations
      await settlementService.settleRound(drawingRound);

      const settledBet = await betService.getBetById(bet.betId);
      expect(settledBet.hitsCount).toBeDefined();

      // Verify hits are calculated correctly
      const drawnNumbers = drawingRound.numbersDrawn;
      const selectedNumbers = bet.numbersSelected;
      const expectedHits = selectedNumbers.filter(n => drawnNumbers.includes(n)).length;
      
      expect(settledBet.hitsCount).toBe(expectedHits);
    });

    it('should handle multiple bets in one round', async () => {
      const round = await roundService.createRound(new Date());

      // Place multiple bets
      const bet1 = await betService.placeBet({
        operatorId: 'test-op-1',
        playerId: 'player-1',
        currency: 'USD',
        stake: 10,
        selections: [1, 2, 3],
      });

      const bet2 = await betService.placeBet({
        operatorId: 'test-op-1',
        playerId: 'player-2',
        currency: 'USD',
        stake: 20,
        selections: [4, 5, 6],
      });

      // Complete round lifecycle
      await roundService.transitionRound(round.roundId, RoundStatus.CLOSING);
      await roundService.transitionRound(round.roundId, RoundStatus.DRAWING);
      await roundService.transitionRound(round.roundId, RoundStatus.SETTLING);

      // Both bets should be settled
      const settledBet1 = await betService.getBetById(bet1.betId);
      const settledBet2 = await betService.getBetById(bet2.betId);

      expect(settledBet1.hitsCount).toBeDefined();
      expect(settledBet2.hitsCount).toBeDefined();
    });
  });

  describe('Bet Validation', () => {
    it('should reject bet if round is not OPEN', async () => {
      const round = await roundService.createRound(new Date());
      await roundService.transitionRound(round.roundId, RoundStatus.CLOSING);

      await expect(
        betService.placeBet({
          operatorId: 'test-op-1',
          playerId: 'test-player-1',
          currency: 'USD',
          stake: 10,
          selections: [1, 2, 3],
        })
      ).rejects.toThrow('Round is not open for betting');
    });

    it('should reject bet if stake is below minimum', async () => {
      const round = await roundService.createRound(new Date());

      await expect(
        betService.placeBet({
          operatorId: 'test-op-1',
          playerId: 'test-player-1',
          currency: 'USD',
          stake: 0.5, // Below minBet of 1
          selections: [1, 2, 3],
        })
      ).rejects.toThrow('Stake must be between');
    });

    it('should reject bet with duplicate numbers', async () => {
      const round = await roundService.createRound(new Date());

      await expect(
        betService.placeBet({
          operatorId: 'test-op-1',
          playerId: 'test-player-1',
          currency: 'USD',
          stake: 10,
          selections: [1, 2, 2, 3], // Duplicate 2
        })
      ).rejects.toThrow('Duplicate numbers');
    });
  });
});
