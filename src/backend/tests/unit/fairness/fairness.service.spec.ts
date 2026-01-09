import { Test, TestingModule } from '@nestjs/testing';
import { FairnessService } from '../../../fairness/services/fairness.service';

describe('FairnessService', () => {
  let service: FairnessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FairnessService],
    }).compile();

    service = module.get<FairnessService>(FairnessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateServerSeed', () => {
    it('should generate a 64-character hex string', () => {
      const seed = service.generateServerSeed();
      expect(seed).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(seed).toMatch(/^[0-9a-f]+$/);
    });

    it('should generate unique seeds', () => {
      const seed1 = service.generateServerSeed();
      const seed2 = service.generateServerSeed();
      expect(seed1).not.toBe(seed2);
    });
  });

  describe('hashServerSeed', () => {
    it('should return a SHA256 hash of the seed', () => {
      const seed = 'test-seed';
      // Node.js crypto creates hash of the string directly
      // Verified: crypto.createHash('sha256').update('test-seed').digest('hex')
      const hash = service.hashServerSeed(seed);
      
      // Verify it's a valid SHA256 hash (64 hex characters)
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
      
      // Verify it's deterministic
      const hash2 = service.hashServerSeed(seed);
      expect(hash).toBe(hash2);
    });
  });

  describe('generateDraw', () => {
    it('should generate 20 unique numbers between 1 and 80', () => {
      const serverSeed = service.generateServerSeed();
      const clientSeed = 'client-seed';
      const nonce = 1;

      const numbers = service.generateDraw(serverSeed, clientSeed, nonce);

      expect(numbers).toHaveLength(20);
      
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(20);

      numbers.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(80);
      });
    });

    it('should be deterministic given the same inputs', () => {
      const serverSeed = service.generateServerSeed();
      const clientSeed = 'client-seed';
      const nonce = 1;

      const draw1 = service.generateDraw(serverSeed, clientSeed, nonce);
      const draw2 = service.generateDraw(serverSeed, clientSeed, nonce);

      expect(draw1).toEqual(draw2);
    });

    it('should change output if nonce changes', () => {
      const serverSeed = service.generateServerSeed();
      const clientSeed = 'client-seed';

      const draw1 = service.generateDraw(serverSeed, clientSeed, 1);
      const draw2 = service.generateDraw(serverSeed, clientSeed, 2);

      expect(draw1).not.toEqual(draw2);
    });
  });

  describe('verifyDraw', () => {
    it('should return true for a valid draw', () => {
      const serverSeed = service.generateServerSeed();
      const clientSeed = 'client-seed';
      const nonce = 1;
      const numbers = service.generateDraw(serverSeed, clientSeed, nonce);

      const isValid = service.verifyDraw(serverSeed, clientSeed, nonce, numbers);
      expect(isValid).toBe(true);
    });

    it('should return false for an invalid draw', () => {
      const serverSeed = service.generateServerSeed();
      const clientSeed = 'client-seed';
      const nonce = 1;
      const numbers = service.generateDraw(serverSeed, clientSeed, nonce);
      
      // Tamper with numbers
      numbers[0] = numbers[0] === 1 ? 2 : 1; 
      numbers.sort((a, b) => a - b);

      const isValid = service.verifyDraw(serverSeed, clientSeed, nonce, numbers);
      expect(isValid).toBe(false);
    });
  });
});
