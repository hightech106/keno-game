import { Test, TestingModule } from '@nestjs/testing';
import { OperatorService } from '../../../src/backend/operator/services/operator.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Operator } from '../../../src/backend/database/entities/operator.entity';
import { OperatorConfig } from '../../../src/backend/database/entities/operator-config.entity';
import { NotFoundException } from '@nestjs/common';

const mockOperatorRepository = {
  findOne: jest.fn(),
};

const mockConfigRepository = {
  findOne: jest.fn(),
};

describe('OperatorService', () => {
  let service: OperatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperatorService,
        { provide: getRepositoryToken(Operator), useValue: mockOperatorRepository },
        { provide: getRepositoryToken(OperatorConfig), useValue: mockConfigRepository },
      ],
    }).compile();

    service = module.get<OperatorService>(OperatorService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOperator', () => {
    it('should return operator if found', async () => {
      const op = { operatorId: 'op-1', name: 'Test Operator' };
      mockOperatorRepository.findOne.mockResolvedValue(op);

      const result = await service.getOperator('op-1');
      expect(result).toEqual(op);
    });

    it('should throw NotFoundException if not found', async () => {
      mockOperatorRepository.findOne.mockResolvedValue(null);

      await expect(service.getOperator('op-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConfig', () => {
    it('should return config if found', async () => {
      const config = { operatorId: 'op-1', minBet: 10 };
      mockConfigRepository.findOne.mockResolvedValue(config);

      const result = await service.getConfig('op-1');
      expect(result).toEqual(config);
    });

    it('should return default config if not found', async () => {
      mockConfigRepository.findOne.mockResolvedValue(null);

      const result = await service.getConfig('op-1');
      expect(result).toBeDefined();
      expect(result.operatorId).toBe('op-1');
      expect(result.minBet).toBe(1.0); // Default
      expect(result.enabled).toBe(true);
    });
  });
});
