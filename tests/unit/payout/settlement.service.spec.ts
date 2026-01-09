import { Test, TestingModule } from '@nestjs/testing';
import { SettlementService } from '../../../src/backend/payout/services/settlement.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bet } from '../../../src/backend/database/entities/bet.entity';
import { PayoutCalculationService } from '../../../src/backend/payout/services/payout-calculation.service';
import { HitDetectionService } from '../../../src/backend/game-engine/services/hit-detection.service';
import { Round } from '../../../src/backend/database/entities/round.entity';

const mockBetRepository = {
  find: jest.fn(),
  save: jest.fn(),
};

const mockPayoutCalcService = {
  calculatePayout: jest.fn(),
};

const mockHitDetectionService = {
  calculateHits: jest.fn(),
};

const mockWalletProvider = {
  credit: jest.fn(),
};

describe('SettlementService', () => {
  let service: SettlementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementService,
        { provide: getRepositoryToken(Bet), useValue: mockBetRepository },
        { provide: PayoutCalculationService, useValue: mockPayoutCalcService },
        { provide: HitDetectionService, useValue: mockHitDetectionService },
        { provide: 'WALLET_PROVIDER', useValue: mockWalletProvider },
      ],
    }).compile();

    service = module.get<SettlementService>(SettlementService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('settleRound', () => {
    it('should do nothing if round has no drawn numbers', async () => {
      const round = { roundId: 'r1', numbersDrawn: [] } as Round;
      await service.settleRound(round);
      expect(mockBetRepository.find).not.toHaveBeenCalled();
    });

    it('should process winning bet correctly', async () => {
      const round = { roundId: 'r1', numbersDrawn: [1, 2, 3, 4, 5] } as Round;
      const bet = { 
        ticketId: 't1', 
        status: 'pending', 
        selections: [1, 2, 3],
        stake: 10,
        playerId: 'p1',
        currency: 'USD'
      } as Bet;

      mockBetRepository.find.mockResolvedValue([bet]);
      mockHitDetectionService.calculateHits.mockReturnValue([1, 2, 3]);
      mockPayoutCalcService.calculatePayout.mockReturnValue({
        isWin: true,
        payoutAmount: 50,
        multiplier: 5,
      });

      await service.settleRound(round);

      expect(mockHitDetectionService.calculateHits).toHaveBeenCalledWith([1, 2, 3], [1, 2, 3, 4, 5]);
      expect(mockPayoutCalcService.calculatePayout).toHaveBeenCalledWith(3, 3, 10);
      
      // Verify Bet Update
      expect(mockBetRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        ticketId: 't1',
        status: 'won',
        payout: 50,
        multiplier: 5,
      }));

      // Verify Wallet Credit
      expect(mockWalletProvider.credit).toHaveBeenCalledWith('p1', 50, 'USD', 'WIN-t1');
    });

    it('should process losing bet correctly', async () => {
      const round = { roundId: 'r1', numbersDrawn: [10, 11, 12] } as Round;
      const bet = { 
        ticketId: 't2', 
        status: 'pending', 
        selections: [1, 2, 3],
        stake: 10
      } as Bet;

      mockBetRepository.find.mockResolvedValue([bet]);
      mockHitDetectionService.calculateHits.mockReturnValue([]);
      mockPayoutCalcService.calculatePayout.mockReturnValue({
        isWin: false,
        payoutAmount: 0,
        multiplier: 0,
      });

      await service.settleRound(round);

      expect(mockBetRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        ticketId: 't2',
        status: 'lost',
        payout: 0,
      }));

      expect(mockWalletProvider.credit).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully for individual bets', async () => {
      const round = { roundId: 'r1', numbersDrawn: [1, 2] } as Round;
      const bet1 = { ticketId: 't1', selections: [1] } as Bet; // Will fail
      const bet2 = { ticketId: 't2', selections: [2], status: 'pending', stake: 10, playerId: 'p2', currency: 'USD' } as Bet; // Will succeed

      mockBetRepository.find.mockResolvedValue([bet1, bet2]);
      
      // Mock failure for bet1
      mockHitDetectionService.calculateHits.mockImplementationOnce(() => {
        throw new Error('Processing failed');
      });
      // Mock success for bet2
      mockHitDetectionService.calculateHits.mockImplementationOnce(() => [2]);
      mockPayoutCalcService.calculatePayout.mockReturnValue({ isWin: true, payoutAmount: 20, multiplier: 2 });

      await service.settleRound(round);

      // bet1 failed, so save shouldn't be called for it (or at least flow stopped)
      // Actually processBet catches error, so loop continues.
      
      // Verify bet2 was processed
      expect(mockBetRepository.save).toHaveBeenCalledWith(expect.objectContaining({ ticketId: 't2' }));
    });
  });
});
