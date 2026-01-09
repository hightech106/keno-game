import { Test, TestingModule } from '@nestjs/testing';
import { PayoutCalculationService } from '../../../src/backend/payout/services/payout-calculation.service';
import { PayoutTableService } from '../../../src/backend/payout/services/payout-table.service';
import { MaxWinLimitService } from '../../../src/backend/payout/services/max-win-limit.service';

describe('PayoutCalculationService', () => {
  let service: PayoutCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutCalculationService,
        PayoutTableService,
        MaxWinLimitService,
      ],
    }).compile();

    service = module.get<PayoutCalculationService>(PayoutCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculatePayout', () => {
    it('should calculate correct payout for winning bet', () => {
      const result = service.calculatePayout(5, 5, 10, undefined);
      expect(result.hits).toBe(5);
      expect(result.multiplier).toBe(800);
      expect(result.baseWinAmount).toBe(8000);
      expect(result.winAmount).toBe(8000);
      expect(result.isWin).toBe(true);
      expect(result.maxWinCapApplied).toBe(false);
    });

    it('should return zero for losing bet', () => {
      const result = service.calculatePayout(5, 1, 10, undefined);
      expect(result.hits).toBe(1);
      expect(result.multiplier).toBe(0);
      expect(result.winAmount).toBe(0);
      expect(result.isWin).toBe(false);
    });

    it('should apply max win limit when exceeded', () => {
      const result = service.calculatePayout(5, 5, 10, 5000);
      expect(result.baseWinAmount).toBe(8000);
      expect(result.winAmount).toBe(5000);
      expect(result.maxWinCapApplied).toBe(true);
    });

    it('should not apply max win limit when not exceeded', () => {
      const result = service.calculatePayout(5, 3, 10, 5000);
      expect(result.baseWinAmount).toBe(30);
      expect(result.winAmount).toBe(30);
      expect(result.maxWinCapApplied).toBe(false);
    });
  });

  describe('calculatePotentialPayout', () => {
    it('should calculate potential payouts for all hit counts', () => {
      const potentials = service.calculatePotentialPayout(5, 10);
      expect(potentials[0]).toBe(0);
      expect(potentials[1]).toBe(0);
      expect(potentials[2]).toBe(10);
      expect(potentials[5]).toBe(8000);
    });

    it('should apply max win limit in potential payouts', () => {
      const potentials = service.calculatePotentialPayout(5, 10, 5000);
      expect(potentials[5]).toBe(5000); // Capped
      expect(potentials[3]).toBe(30); // Not capped
    });
  });
});
