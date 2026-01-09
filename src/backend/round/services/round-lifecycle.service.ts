import { Injectable } from '@nestjs/common';
import { RoundStatus } from '../../common/enums/round-status.enum';

/**
 * Round Lifecycle Service
 * Manages state transitions for rounds
 * States: OPEN → CLOSING → DRAWING → SETTLING → PAYOUT → ARCHIVED
 */
@Injectable()
export class RoundLifecycleService {
  /**
   * Valid state transitions
   */
  private readonly validTransitions: Map<RoundStatus, RoundStatus[]> =
    new Map([
      [RoundStatus.OPEN, [RoundStatus.CLOSING, RoundStatus.CANCELLED]],
      [RoundStatus.CLOSING, [RoundStatus.DRAWING, RoundStatus.CANCELLED]],
      [RoundStatus.DRAWING, [RoundStatus.SETTLING, RoundStatus.CANCELLED]],
      [RoundStatus.SETTLING, [RoundStatus.PAYOUT, RoundStatus.CANCELLED]],
      [RoundStatus.PAYOUT, [RoundStatus.ARCHIVED]],
      [RoundStatus.ARCHIVED, []], // Terminal state
      [RoundStatus.CANCELLED, []], // Terminal state
    ]);

  /**
   * Check if a state transition is valid
   */
  canTransition(
    currentStatus: RoundStatus,
    newStatus: RoundStatus,
  ): boolean {
    const allowedTransitions = this.validTransitions.get(currentStatus) || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Transition round to new status (with validation)
   */
  transition(currentStatus: RoundStatus, newStatus: RoundStatus): RoundStatus {
    if (!this.canTransition(currentStatus, newStatus)) {
      throw new Error(
        `Invalid state transition from ${currentStatus} to ${newStatus}`,
      );
    }

    return newStatus;
  }

  /**
   * Check if round is accepting bets
   */
  isAcceptingBets(status: RoundStatus): boolean {
    return status === RoundStatus.OPEN;
  }

  /**
   * Check if round is terminal (cannot change)
   */
  isTerminal(status: RoundStatus): boolean {
    return (
      status === RoundStatus.ARCHIVED || status === RoundStatus.CANCELLED
    );
  }

  /**
   * Get next state in the normal flow
   */
  getNextState(currentStatus: RoundStatus): RoundStatus | null {
    switch (currentStatus) {
      case RoundStatus.OPEN:
        return RoundStatus.CLOSING;
      case RoundStatus.CLOSING:
        return RoundStatus.DRAWING;
      case RoundStatus.DRAWING:
        return RoundStatus.SETTLING;
      case RoundStatus.SETTLING:
        return RoundStatus.PAYOUT;
      case RoundStatus.PAYOUT:
        return RoundStatus.ARCHIVED;
      default:
        return null; // Terminal or invalid
    }
  }
}
