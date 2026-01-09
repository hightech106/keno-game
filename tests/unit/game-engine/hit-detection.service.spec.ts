import { Test, TestingModule } from '@nestjs/testing';
import { HitDetectionService } from '../../../src/backend/game-engine/services/hit-detection.service';

describe('HitDetectionService', () => {
  let service: HitDetectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HitDetectionService],
    }).compile();

    service = module.get<HitDetectionService>(HitDetectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateHits', () => {
    it('should calculate correct number of hits', () => {
      const playerNumbers = [1, 2, 3, 4, 5];
      const drawnNumbers = [1, 2, 10, 20, 30, 40, 50, 60, 70, 80, 5, 15, 25, 35, 45, 55, 65, 75, 3, 4];
      const hits = service.calculateHits(playerNumbers, drawnNumbers);
      expect(hits).toBe(5);
    });

    it('should return 0 when no matches', () => {
      const playerNumbers = [1, 2, 3, 4, 5];
      const drawnNumbers = [10, 20, 30, 40, 50, 60, 70, 80, 11, 21, 31, 41, 51, 61, 71, 6, 16, 26, 36, 46];
      const hits = service.calculateHits(playerNumbers, drawnNumbers);
      expect(hits).toBe(0);
    });

    it('should handle partial matches', () => {
      const playerNumbers = [1, 2, 3, 4, 5];
      const drawnNumbers = [1, 2, 10, 20, 30, 40, 50, 60, 70, 80, 11, 21, 31, 41, 51, 61, 71, 6, 16, 26];
      const hits = service.calculateHits(playerNumbers, drawnNumbers);
      expect(hits).toBe(2);
    });
  });

  describe('validateSelections', () => {
    it('should validate correct selections', () => {
      expect(service.validateSelections([1, 2, 3])).toBe(true);
      expect(service.validateSelections([1])).toBe(true);
      expect(service.validateSelections(Array.from({ length: 10 }, (_, i) => i + 1))).toBe(true);
    });

    it('should reject empty selection', () => {
      expect(service.validateSelections([])).toBe(false);
    });

    it('should reject too many selections', () => {
      expect(service.validateSelections(Array.from({ length: 11 }, (_, i) => i + 1))).toBe(false);
    });

    it('should reject duplicates', () => {
      expect(service.validateSelections([1, 2, 2, 3])).toBe(false);
    });

    it('should reject out of range numbers', () => {
      expect(service.validateSelections([0, 1, 2])).toBe(false);
      expect(service.validateSelections([1, 2, 81])).toBe(false);
    });
  });

  describe('getMatchedNumbers', () => {
    it('should return matched numbers', () => {
      const playerNumbers = [1, 2, 3, 4, 5];
      const drawnNumbers = [1, 2, 10, 20, 30, 40, 50, 60, 70, 80, 5, 15, 25, 35, 45, 55, 65, 75, 3, 4];
      const matches = service.getMatchedNumbers(playerNumbers, drawnNumbers);
      expect(matches).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return empty array when no matches', () => {
      const playerNumbers = [1, 2, 3];
      const drawnNumbers = [10, 20, 30, 40, 50, 60, 70, 80, 11, 21, 31, 41, 51, 61, 71, 6, 16, 26, 36, 46];
      const matches = service.getMatchedNumbers(playerNumbers, drawnNumbers);
      expect(matches).toEqual([]);
    });
  });
});
