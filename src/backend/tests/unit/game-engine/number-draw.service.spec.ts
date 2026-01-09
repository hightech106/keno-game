import { Test, TestingModule } from '@nestjs/testing';
import { NumberDrawService } from '../../../game-engine/services/number-draw.service';

describe('NumberDrawService', () => {
  let service: NumberDrawService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NumberDrawService],
    }).compile();

    service = module.get<NumberDrawService>(NumberDrawService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDrawNumbers', () => {
    it('should generate exactly 20 numbers', () => {
      const numbers = service.generateDrawNumbers();
      expect(numbers).toHaveLength(20);
    });

    it('should generate numbers within 1-80 range', () => {
      const numbers = service.generateDrawNumbers();
      numbers.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(80);
      });
    });

    it('should generate unique numbers', () => {
      const numbers = service.generateDrawNumbers();
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(20);
    });

    it('should return sorted numbers', () => {
      const numbers = service.generateDrawNumbers();
      const sorted = [...numbers].sort((a, b) => a - b);
      expect(numbers).toEqual(sorted);
    });

    it('should generate deterministic numbers with same seed', () => {
      const seed = 'test-seed-123';
      const numbers1 = service.generateDrawNumbers(seed);
      const numbers2 = service.generateDrawNumbers(seed);
      expect(numbers1).toEqual(numbers2);
    });

    it('should generate different numbers with different seeds', () => {
      const numbers1 = service.generateDrawNumbers('seed-1');
      const numbers2 = service.generateDrawNumbers('seed-2');
      expect(numbers1).not.toEqual(numbers2);
    });
  });

  describe('validateDrawNumbers', () => {
    it('should validate correct draw numbers', () => {
      const validNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      expect(service.validateDrawNumbers(validNumbers)).toBe(true);
    });

    it('should reject wrong count', () => {
      const invalidNumbers = [1, 2, 3];
      expect(service.validateDrawNumbers(invalidNumbers)).toBe(false);
    });

    it('should reject duplicates', () => {
      const invalidNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 1];
      expect(service.validateDrawNumbers(invalidNumbers)).toBe(false);
    });

    it('should reject out of range numbers', () => {
      const invalidNumbers = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 81];
      expect(service.validateDrawNumbers(invalidNumbers)).toBe(false);
    });
  });
});
