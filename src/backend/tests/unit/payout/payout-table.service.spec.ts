import { Test, TestingModule } from '@nestjs/testing';
import { PayoutTableService } from '../../../payout/services/payout-table.service';

describe('PayoutTableService', () => {
  let service: PayoutTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayoutTableService],
    }).compile();

    service = module.get<PayoutTableService>(PayoutTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMultiplier', () => {
    it('should return correct multipliers for Pick 1', () => {
      expect(service.getMultiplier(1, 0)).toBe(0);
      expect(service.getMultiplier(1, 1)).toBe(3.9);
    });

    it('should return correct multipliers for Pick 5', () => {
      expect(service.getMultiplier(5, 0)).toBe(0);
      expect(service.getMultiplier(5, 1)).toBe(0);
      expect(service.getMultiplier(5, 2)).toBe(1);
      expect(service.getMultiplier(5, 3)).toBe(3);
      expect(service.getMultiplier(5, 4)).toBe(15);
      expect(service.getMultiplier(5, 5)).toBe(800);
    });

    it('should return correct multipliers for Pick 10', () => {
      expect(service.getMultiplier(10, 10)).toBe(10000);
      expect(service.getMultiplier(10, 9)).toBe(6000);
      expect(service.getMultiplier(10, 5)).toBe(2);
    });

    it('should throw error for invalid pick count', () => {
      expect(() => service.getMultiplier(0, 1)).toThrow();
      expect(() => service.getMultiplier(11, 1)).toThrow();
    });

    it('should throw error for invalid hits', () => {
      expect(() => service.getMultiplier(5, -1)).toThrow();
      expect(() => service.getMultiplier(5, 6)).toThrow();
    });
  });

  describe('isWinning', () => {
    it('should return true for winning combinations', () => {
      expect(service.isWinning(5, 5)).toBe(true);
      expect(service.isWinning(1, 1)).toBe(true);
    });

    it('should return false for losing combinations', () => {
      expect(service.isWinning(5, 0)).toBe(false);
      expect(service.isWinning(5, 1)).toBe(false);
      expect(service.isWinning(4, 1)).toBe(false);
    });
  });

  describe('validatePayoutTables', () => {
    it('should validate all payout tables exist', () => {
      expect(service.validatePayoutTables()).toBe(true);
    });
  });
});
