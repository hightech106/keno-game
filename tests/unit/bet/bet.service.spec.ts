import { Test, TestingModule } from '@nestjs/testing';
import { BetService } from '../../../src/backend/bet/services/bet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bet } from '../../../src/backend/database/entities/bet.entity';
import { RoundService } from '../../../src/backend/round/services/round.service';
import { OperatorService } from '../../../src/backend/operator/services/operator.service';
import { PayoutTableService } from '../../../src/backend/payout/services/payout-table.service';
import { PayoutCalculationService } from '../../../src/backend/payout/services/payout-calculation.service';
import { RoundStatus } from '../../../src/backend/common/enums/round-status.enum';

const mockBetRepository = {
  create: jest.fn().mockImplementation(dto => dto),
  save: jest.fn().mockImplementation(bet => Promise.resolve({ ...bet, ticketId: 'test-ticket-id' })),
};

const mockWalletProvider = {
  debit: jest.fn().mockResolvedValue({ success: true, transactionId: 'tx-123' }),
};

const mockRoundService = {
  getOrCreateCurrentRound: jest.fn(),
};

const mockOperatorService = {
  getConfig: jest.fn(),
};

const mockPayoutTableService = {
  getMaxMultiplier: jest.fn().mockReturnValue(100),
};

const mockPayoutCalculationService = {};

describe('BetService', () => {
  let service: BetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BetService,
        { provide: getRepositoryToken(Bet), useValue: mockBetRepository },
        { provide: 'WALLET_PROVIDER', useValue: mockWalletProvider },
        { provide: RoundService, useValue: mockRoundService },
        { provide: OperatorService, useValue: mockOperatorService },
        { provide: PayoutTableService, useValue: mockPayoutTableService },
        { provide: PayoutCalculationService, useValue: mockPayoutCalculationService },
      ],
    }).compile();

    service = module.get<BetService>(BetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should place a bet successfully', async () => {
    mockRoundService.getOrCreateCurrentRound.mockResolvedValue({
      roundId: 'round-1',
      status: RoundStatus.OPEN,
    });

    mockOperatorService.getConfig.mockResolvedValue({
      enabled: true,
      minBet: 1,
      maxBet: 100,
      maxWinPerTicket: 10000,
    });

    const dto = {
      operatorId: 'op-1',
      playerId: 'player-1',
      currency: 'USD',
      stake: 10,
      selections: [1, 2, 3, 4, 5],
    };

    const result = await service.placeBet(dto);

    expect(result).toBeDefined();
    expect(mockWalletProvider.debit).toHaveBeenCalled();
    expect(mockBetRepository.save).toHaveBeenCalled();
  });

  it('should throw BadRequestException if round is not open', async () => {
    mockRoundService.getOrCreateCurrentRound.mockResolvedValue({
      roundId: 'round-1',
      status: RoundStatus.CLOSING,
    });

    const dto = {
      operatorId: 'op-1',
      playerId: 'player-1',
      currency: 'USD',
      stake: 10,
      selections: [1, 2, 3, 4, 5],
    };

    await expect(service.placeBet(dto)).rejects.toThrow('Round is not open for betting');
  });

  it('should throw BadRequestException if operator is disabled', async () => {
    mockRoundService.getOrCreateCurrentRound.mockResolvedValue({
      roundId: 'round-1',
      status: RoundStatus.OPEN,
    });

    mockOperatorService.getConfig.mockResolvedValue({
      enabled: false,
    });

    const dto = {
      operatorId: 'op-1',
      playerId: 'player-1',
      currency: 'USD',
      stake: 10,
      selections: [1, 2, 3, 4, 5],
    };

    await expect(service.placeBet(dto)).rejects.toThrow('Operator is disabled');
  });

  it('should throw BadRequestException if stake is invalid', async () => {
    mockRoundService.getOrCreateCurrentRound.mockResolvedValue({
      roundId: 'round-1',
      status: RoundStatus.OPEN,
    });

    mockOperatorService.getConfig.mockResolvedValue({
      enabled: true,
      minBet: 5,
      maxBet: 100,
    });

    const dtoLow = {
      operatorId: 'op-1',
      playerId: 'player-1',
      currency: 'USD',
      stake: 1, // Too low
      selections: [1, 2, 3, 4, 5],
    };

    await expect(service.placeBet(dtoLow)).rejects.toThrow('Stake must be between 5 and 100');

    const dtoHigh = {
      ...dtoLow,
      stake: 200, // Too high
    };

    await expect(service.placeBet(dtoHigh)).rejects.toThrow('Stake must be between 5 and 100');
  });

  it('should throw BadRequestException if selections contain duplicates', async () => {
    mockRoundService.getOrCreateCurrentRound.mockResolvedValue({
      roundId: 'round-1',
      status: RoundStatus.OPEN,
    });

    mockOperatorService.getConfig.mockResolvedValue({
      enabled: true,
      minBet: 1,
      maxBet: 100,
    });

    const dto = {
      operatorId: 'op-1',
      playerId: 'player-1',
      currency: 'USD',
      stake: 10,
      selections: [1, 2, 2, 3], // Duplicate 2
    };

    await expect(service.placeBet(dto)).rejects.toThrow('Duplicate numbers in selection');
  });

  it('should throw BadRequestException if wallet debit fails', async () => {
    mockRoundService.getOrCreateCurrentRound.mockResolvedValue({
      roundId: 'round-1',
      status: RoundStatus.OPEN,
    });

    mockOperatorService.getConfig.mockResolvedValue({
      enabled: true,
      minBet: 1,
      maxBet: 100,
    });

    mockWalletProvider.debit.mockResolvedValueOnce({ success: false, error: 'Insufficient funds' });

    const dto = {
      operatorId: 'op-1',
      playerId: 'player-1',
      currency: 'USD',
      stake: 10,
      selections: [1, 2, 3, 4, 5],
    };

    await expect(service.placeBet(dto)).rejects.toThrow('Wallet debit failed: Insufficient funds');
  });
});
