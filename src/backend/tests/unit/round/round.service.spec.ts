import { Test, TestingModule } from '@nestjs/testing';
import { RoundService } from '../../../round/services/round.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Round } from '../../../database/entities/round.entity';
import { RoundLifecycleService } from '../../../round/services/round-lifecycle.service';
import { NumberDrawService } from '../../../game-engine/services/number-draw.service';
import { FairnessService } from '../../../fairness/services/fairness.service';
import { SettlementService } from '../../../payout/services/settlement.service';
import { GameGateway } from '../../../gateway/game.gateway';
import { RoundStatus } from '../../../common/enums/round-status.enum';

const mockRoundRepository = {
  create: jest.fn().mockImplementation(dto => dto),
  save: jest.fn().mockImplementation(round => Promise.resolve(round)),
  findOne: jest.fn(),
  increment: jest.fn(),
};

const mockLifecycleService = {
  transition: jest.fn(),
};

const mockNumberDrawService = {
  drawNumbers: jest.fn(),
};

const mockFairnessService = {
  generateServerSeed: jest.fn().mockReturnValue('mock-server-seed'),
  hashServerSeed: jest.fn().mockReturnValue('mock-server-seed-hash'),
  generateDraw: jest.fn().mockReturnValue([1, 2, 3, 4, 5]),
};

const mockSettlementService = {
  settleRound: jest.fn(),
};

const mockGameGateway = {
  emitRoundStateChange: jest.fn(),
  emitDrawNumbers: jest.fn(),
  emitRoundSettled: jest.fn(),
};

describe('RoundService', () => {
  let service: RoundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoundService,
        { provide: getRepositoryToken(Round), useValue: mockRoundRepository },
        { provide: RoundLifecycleService, useValue: mockLifecycleService },
        { provide: NumberDrawService, useValue: mockNumberDrawService },
        { provide: FairnessService, useValue: mockFairnessService },
        { provide: SettlementService, useValue: mockSettlementService },
        { provide: GameGateway, useValue: mockGameGateway },
      ],
    }).compile();

    service = module.get<RoundService>(RoundService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRound', () => {
    it('should create a new round with correct initial state', async () => {
      const scheduledTime = new Date();
      const round = await service.createRound(scheduledTime);

      expect(round.status).toBe(RoundStatus.OPEN);
      expect(round.serverSeed).toBe('mock-server-seed');
      expect(round.serverSeedHash).toBe('mock-server-seed-hash');
      expect(mockRoundRepository.create).toHaveBeenCalled();
      expect(mockRoundRepository.save).toHaveBeenCalled();
    });
  });

  describe('transitionRound', () => {
    it('should transition round and emit events', async () => {
      const roundId = 'round-1';
      const existingRound = {
        roundId,
        status: RoundStatus.OPEN,
        serverSeed: 'seed',
        nonce: 1,
      };

      mockRoundRepository.findOne.mockResolvedValue(existingRound);
      mockLifecycleService.transition.mockReturnValue(RoundStatus.CLOSING);

      const result = await service.transitionRound(roundId, RoundStatus.CLOSING);

      expect(result.status).toBe(RoundStatus.CLOSING);
      expect(mockGameGateway.emitRoundStateChange).toHaveBeenCalledWith(
        roundId,
        RoundStatus.CLOSING,
        expect.any(Object) // scheduledTime might be undefined in mock, but strictly it's part of round
      );
    });

    it('should generate draw numbers when transitioning to DRAWING', async () => {
      const roundId = 'round-1';
      const existingRound = {
        roundId,
        status: RoundStatus.CLOSING,
        serverSeed: 'seed',
        clientSeed: 'client-seed',
        nonce: 1,
      };

      mockRoundRepository.findOne.mockResolvedValue(existingRound);
      mockLifecycleService.transition.mockReturnValue(RoundStatus.DRAWING);

      const result = await service.transitionRound(roundId, RoundStatus.DRAWING);

      expect(result.status).toBe(RoundStatus.DRAWING);
      expect(mockFairnessService.generateDraw).toHaveBeenCalled();
      expect(result.numbersDrawn).toEqual([1, 2, 3, 4, 5]);
      expect(mockGameGateway.emitDrawNumbers).toHaveBeenCalled();
    });

    it('should call settlement service when transitioning to SETTLING', async () => {
      const roundId = 'round-1';
      const existingRound = {
        roundId,
        status: RoundStatus.DRAWING,
        numbersDrawn: [1, 2, 3],
      };

      mockRoundRepository.findOne.mockResolvedValue(existingRound);
      mockLifecycleService.transition.mockReturnValue(RoundStatus.SETTLING);

      await service.transitionRound(roundId, RoundStatus.SETTLING);

      expect(mockSettlementService.settleRound).toHaveBeenCalledWith(existingRound);
    });
  });
});
