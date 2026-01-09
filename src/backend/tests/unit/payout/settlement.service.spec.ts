import { Test, TestingModule } from '@nestjs/testing';
import { SettlementService } from '../../../payout/services/settlement.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bet } from '../../../database/entities/bet.entity';
import { PayoutCalculationService } from '../../../payout/services/payout-calculation.service';
import { HitDetectionService } from '../../../game-engine/services/hit-detection.service';
import { Round } from '../../../database/entities/round.entity';
import { OperatorService } from '../../../operator/services/operator.service';
import { AuditLogService } from '../../../common/services/audit-log.service';

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
  credit: jest.fn().mockResolvedValue({ success: true }),
};

const mockOperatorService = {
  getOperator: jest.fn().mockResolvedValue({ defaultCurrency: 'USD' }),
  getConfig: jest.fn().mockResolvedValue({ maxWinPerTicket: 10000 }),
};

const mockAuditLogService = {
  logBetSettlement: jest.fn(),
  logWalletOperation: jest.fn(),
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
        { provide: OperatorService, useValue: mockOperatorService },
        { provide: AuditLogService, useValue: mockAuditLogService },
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
        betId: 'BET-1',
        operatorId: 'op-1',
        roundId: 'r1',
        playerId: 'p1',
        numbersSelected: [1, 2, 3],
        selectionCount: 3,
        betAmount: 10,
        credited: false,
      } as Bet;

      mockBetRepository.find.mockResolvedValue([bet]);
      mockHitDetectionService.calculateHits.mockReturnValue(3); // Returns hit count
      mockPayoutCalcService.calculatePayout.mockReturnValue({
        hits: 3,
        multiplier: 5,
        baseWinAmount: 50,
        winAmount: 50,
        maxWinCapApplied: false,
        isWin: true,
      });

      await service.settleRound(round);

      expect(mockHitDetectionService.calculateHits).toHaveBeenCalledWith([1, 2, 3], [1, 2, 3, 4, 5]);
      expect(mockPayoutCalcService.calculatePayout).toHaveBeenCalledWith(3, 3, 10, 10000);
      
      // Verify Bet Update
      expect(mockBetRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        betId: 'BET-1',
        hitsCount: 3,
        payoutMultiplier: 5,
        winAmount: 50,
        credited: true,
      }));

      // Verify Wallet Credit
      expect(mockWalletProvider.credit).toHaveBeenCalledWith('p1', 50, 'USD', 'WIN-BET-1');
    });

    it('should process losing bet correctly', async () => {
      const round = { roundId: 'r1', numbersDrawn: [10, 11, 12] } as Round;
      const bet = { 
        betId: 'BET-2',
        operatorId: 'op-1',
        roundId: 'r1',
        playerId: 'p1',
        numbersSelected: [1, 2, 3],
        selectionCount: 3,
        betAmount: 10,
        credited: false,
      } as Bet;

      mockBetRepository.find.mockResolvedValue([bet]);
      mockHitDetectionService.calculateHits.mockReturnValue(0); // No hits
      mockPayoutCalcService.calculatePayout.mockReturnValue({
        hits: 0,
        multiplier: 0,
        baseWinAmount: 0,
        winAmount: 0,
        maxWinCapApplied: false,
        isWin: false,
      });

      await service.settleRound(round);

      expect(mockBetRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        betId: 'BET-2',
        hitsCount: 0,
        payoutMultiplier: 0,
        winAmount: 0,
        credited: false,
      }));

      expect(mockWalletProvider.credit).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully for individual bets', async () => {
      const round = { roundId: 'r1', numbersDrawn: [1, 2] } as Round;
      const bet1 = { 
        betId: 'BET-1',
        operatorId: 'op-1',
        roundId: 'r1',
        playerId: 'p1',
        numbersSelected: [1],
        selectionCount: 1,
        betAmount: 10,
        credited: false,
      } as Bet; // Will fail
      const bet2 = { 
        betId: 'BET-2',
        operatorId: 'op-1',
        roundId: 'r1',
        playerId: 'p2',
        numbersSelected: [2],
        selectionCount: 1,
        betAmount: 10,
        credited: false,
      } as Bet; // Will succeed

      mockBetRepository.find.mockResolvedValue([bet1, bet2]);
      
      // Mock failure for bet1
      mockHitDetectionService.calculateHits.mockImplementationOnce(() => {
        throw new Error('Processing failed');
      });
      // Mock success for bet2
      mockHitDetectionService.calculateHits.mockImplementationOnce(() => 1); // 1 hit
      mockPayoutCalcService.calculatePayout.mockReturnValue({ 
        hits: 1,
        multiplier: 2,
        baseWinAmount: 20,
        winAmount: 20,
        maxWinCapApplied: false,
        isWin: true,
      });

      await service.settleRound(round);

      // bet1 failed, but processBet catches error, so loop continues
      // Verify bet2 was processed
      expect(mockBetRepository.save).toHaveBeenCalledWith(expect.objectContaining({ betId: 'BET-2' }));
    });
  });
});
