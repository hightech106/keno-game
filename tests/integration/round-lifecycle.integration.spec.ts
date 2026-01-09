import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { RoundService } from '../../src/backend/round/services/round.service';
import { RoundSchedulerService } from '../../src/backend/scheduler/services/round-scheduler.service';
import { RoundStatus } from '../../src/backend/common/enums/round-status.enum';
import { Round } from '../../src/backend/database/entities/round.entity';
import { createTestModule, closeTestModule } from './test-setup';

describe('Round Lifecycle Integration', () => {
  let module: TestingModule;
  let roundService: RoundService;
  let schedulerService: RoundSchedulerService;
  let dataSource: DataSource;

  beforeAll(async () => {
    module = await createTestModule();
    roundService = module.get<RoundService>(RoundService);
    schedulerService = module.get<RoundSchedulerService>(RoundSchedulerService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await closeTestModule(module);
  });

  beforeEach(async () => {
    // Clean database before each test
    await dataSource.query('TRUNCATE TABLE rounds CASCADE');
  });

  describe('Complete Round Lifecycle', () => {
    it('should create a round and transition through all states', async () => {
      // 1. Create a round
      const scheduledTime = new Date();
      const round = await roundService.createRound(scheduledTime);
      
      expect(round).toBeDefined();
      expect(round.status).toBe(RoundStatus.OPEN);
      expect(round.serverSeed).toBeDefined();
      expect(round.serverSeedHash).toBeDefined();
      expect(round.nonce).toBe(1);

      // 2. Transition to CLOSING
      const closingRound = await roundService.transitionRound(round.roundId, RoundStatus.CLOSING);
      expect(closingRound.status).toBe(RoundStatus.CLOSING);
      expect(closingRound.closeTime).toBeDefined();

      // 3. Transition to DRAWING (should generate numbers)
      const drawingRound = await roundService.transitionRound(round.roundId, RoundStatus.DRAWING);
      expect(drawingRound.status).toBe(RoundStatus.DRAWING);
      expect(drawingRound.drawTime).toBeDefined();
      expect(drawingRound.numbersDrawn).toBeDefined();
      expect(drawingRound.numbersDrawn.length).toBe(20);
      expect(drawingRound.numbersDrawn.every(n => n >= 1 && n <= 80)).toBe(true);

      // 4. Transition to SETTLING
      const settlingRound = await roundService.transitionRound(round.roundId, RoundStatus.SETTLING);
      expect(settlingRound.status).toBe(RoundStatus.SETTLING);

      // 5. Transition to PAYOUT
      const payoutRound = await roundService.transitionRound(round.roundId, RoundStatus.PAYOUT);
      expect(payoutRound.status).toBe(RoundStatus.PAYOUT);

      // 6. Transition to ARCHIVED
      const archivedRound = await roundService.transitionRound(round.roundId, RoundStatus.ARCHIVED);
      expect(archivedRound.status).toBe(RoundStatus.ARCHIVED);
      expect(archivedRound.resultPublished).toBe(true);
    });

    it('should generate unique numbers for each round', async () => {
      const round1 = await roundService.createRound(new Date());
      const round2 = await roundService.createRound(new Date());

      await roundService.transitionRound(round1.roundId, RoundStatus.DRAWING);
      await roundService.transitionRound(round2.roundId, RoundStatus.DRAWING);

      const updatedRound1 = await roundService.getRoundById(round1.roundId);
      const updatedRound2 = await roundService.getRoundById(round2.roundId);

      expect(updatedRound1.numbersDrawn).toBeDefined();
      expect(updatedRound2.numbersDrawn).toBeDefined();
      
      // Numbers should be different (very high probability)
      const numbers1 = updatedRound1.numbersDrawn.sort().join(',');
      const numbers2 = updatedRound2.numbersDrawn.sort().join(',');
      expect(numbers1).not.toBe(numbers2);
    });

    it('should maintain server seed hash consistency', async () => {
      const round = await roundService.createRound(new Date());
      const originalHash = round.serverSeedHash;

      // Transition through states
      await roundService.transitionRound(round.roundId, RoundStatus.CLOSING);
      await roundService.transitionRound(round.roundId, RoundStatus.DRAWING);

      const updatedRound = await roundService.getRoundById(round.roundId);
      expect(updatedRound.serverSeedHash).toBe(originalHash);
    });
  });

  describe('Round State Transitions', () => {
    it('should prevent invalid state transitions', async () => {
      const round = await roundService.createRound(new Date());

      // Try to skip CLOSING and go directly to DRAWING
      // This should be handled by RoundLifecycleService
      await expect(
        roundService.transitionRound(round.roundId, RoundStatus.DRAWING)
      ).rejects.toThrow();
    });

    it('should allow CANCELLED from any state', async () => {
      const round = await roundService.createRound(new Date());
      
      // Cancel from OPEN
      const cancelledRound = await roundService.transitionRound(
        round.roundId,
        RoundStatus.CANCELLED
      );
      expect(cancelledRound.status).toBe(RoundStatus.CANCELLED);
    });
  });
});
