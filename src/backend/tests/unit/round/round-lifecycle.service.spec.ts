import { Test, TestingModule } from '@nestjs/testing';
import { RoundLifecycleService } from '../../../round/services/round-lifecycle.service';
import { RoundStatus } from '../../../common/enums/round-status.enum';

describe('RoundLifecycleService', () => {
  let service: RoundLifecycleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoundLifecycleService],
    }).compile();

    service = module.get<RoundLifecycleService>(RoundLifecycleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('canTransition', () => {
    it('should allow valid transitions', () => {
      expect(service.canTransition(RoundStatus.OPEN, RoundStatus.CLOSING)).toBe(true);
      expect(service.canTransition(RoundStatus.CLOSING, RoundStatus.DRAWING)).toBe(true);
      expect(service.canTransition(RoundStatus.DRAWING, RoundStatus.SETTLING)).toBe(true);
    });

    it('should reject invalid transitions', () => {
      expect(service.canTransition(RoundStatus.OPEN, RoundStatus.ARCHIVED)).toBe(false);
      expect(service.canTransition(RoundStatus.ARCHIVED, RoundStatus.OPEN)).toBe(false);
    });

    it('should allow cancellation from non-terminal states', () => {
      expect(service.canTransition(RoundStatus.OPEN, RoundStatus.CANCELLED)).toBe(true);
      expect(service.canTransition(RoundStatus.DRAWING, RoundStatus.CANCELLED)).toBe(true);
    });
  });

  describe('transition', () => {
    it('should perform valid transition', () => {
      const newStatus = service.transition(RoundStatus.OPEN, RoundStatus.CLOSING);
      expect(newStatus).toBe(RoundStatus.CLOSING);
    });

    it('should throw error for invalid transition', () => {
      expect(() => {
        service.transition(RoundStatus.OPEN, RoundStatus.ARCHIVED);
      }).toThrow();
    });
  });

  describe('isAcceptingBets', () => {
    it('should return true only for OPEN status', () => {
      expect(service.isAcceptingBets(RoundStatus.OPEN)).toBe(true);
      expect(service.isAcceptingBets(RoundStatus.CLOSING)).toBe(false);
      expect(service.isAcceptingBets(RoundStatus.DRAWING)).toBe(false);
    });
  });

  describe('isTerminal', () => {
    it('should return true for terminal states', () => {
      expect(service.isTerminal(RoundStatus.ARCHIVED)).toBe(true);
      expect(service.isTerminal(RoundStatus.CANCELLED)).toBe(true);
      expect(service.isTerminal(RoundStatus.OPEN)).toBe(false);
    });
  });

  describe('getNextState', () => {
    it('should return next state in normal flow', () => {
      expect(service.getNextState(RoundStatus.OPEN)).toBe(RoundStatus.CLOSING);
      expect(service.getNextState(RoundStatus.CLOSING)).toBe(RoundStatus.DRAWING);
      expect(service.getNextState(RoundStatus.DRAWING)).toBe(RoundStatus.SETTLING);
      expect(service.getNextState(RoundStatus.SETTLING)).toBe(RoundStatus.PAYOUT);
      expect(service.getNextState(RoundStatus.PAYOUT)).toBe(RoundStatus.ARCHIVED);
    });

    it('should return null for terminal states', () => {
      expect(service.getNextState(RoundStatus.ARCHIVED)).toBeNull();
      expect(service.getNextState(RoundStatus.CANCELLED)).toBeNull();
    });
  });
});
