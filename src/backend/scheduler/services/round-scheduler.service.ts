import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RoundService } from '../../round/services/round.service';
import { RoundLifecycleService } from '../../round/services/round-lifecycle.service';
import { RoundStatus } from '../../common/enums/round-status.enum';

/**
 * Round Scheduler Service
 * Manages automatic 10-second round scheduling
 * Phase 1: Basic implementation
 * Phase 2: Will add Redis-based distributed scheduling
 */
@Injectable()
export class RoundSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(RoundSchedulerService.name);
  private readonly ROUND_DURATION_SECONDS = 10;
  private readonly BETTING_WINDOW_SECONDS = 8;

  constructor(
    private readonly roundService: RoundService,
    private readonly lifecycleService: RoundLifecycleService,
  ) {}

  /**
   * Initialize scheduler - create first round
   */
  async onModuleInit() {
    this.logger.log('Initializing round scheduler...');
    await this.ensureCurrentRound();
  }

  /**
   * Main round cycle - runs every 10 seconds
   * This will be replaced with more sophisticated scheduling in production
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleRoundCycle() {
    try {
      // Get current round
      const currentRound = await this.roundService.getOrCreateCurrentRound();

      const now = new Date();
      const roundAge = (now.getTime() - currentRound.openTime.getTime()) / 1000;

      // Transition based on time elapsed
      if (roundAge >= this.BETTING_WINDOW_SECONDS && roundAge < this.ROUND_DURATION_SECONDS) {
        // Enter closing phase
        if (currentRound.status === RoundStatus.OPEN) {
          await this.roundService.transitionRound(currentRound.roundId, RoundStatus.CLOSING);
          this.logger.log(`Round ${currentRound.roundId} entered CLOSING phase`);
        }
      } else if (roundAge >= this.ROUND_DURATION_SECONDS) {
        // Complete the round lifecycle
        await this.completeRoundCycle(currentRound.roundId);
        
        // Create new round
        const nextScheduledTime = new Date(now.getTime() + this.ROUND_DURATION_SECONDS * 1000);
        const newRound = await this.roundService.createRound(nextScheduledTime);
        this.logger.log(`New round created: ${newRound.roundId}`);
      }
    } catch (error) {
      this.logger.error('Error in round cycle:', error);
    }
  }

  /**
   * Complete full round cycle: DRAWING → SETTLING → PAYOUT → ARCHIVED
   */
  private async completeRoundCycle(roundId: string) {
    try {
      // Drawing
      await this.roundService.transitionRound(roundId, RoundStatus.DRAWING);
      this.logger.log(`Round ${roundId} entered DRAWING phase`);

      // Settlement (calculate payouts)
      await this.roundService.transitionRound(roundId, RoundStatus.SETTLING);
      this.logger.log(`Round ${roundId} entered SETTLING phase`);

      // Payout (credit winnings)
      await this.roundService.transitionRound(roundId, RoundStatus.PAYOUT);
      this.logger.log(`Round ${roundId} entered PAYOUT phase`);

      // Archive
      await this.roundService.transitionRound(roundId, RoundStatus.ARCHIVED);
      this.logger.log(`Round ${roundId} completed and archived`);
    } catch (error) {
      this.logger.error(`Error completing round ${roundId}:`, error);
      // TODO: Handle failures - rollback bets, etc.
    }
  }

  /**
   * Ensure there's always a current round available
   */
  private async ensureCurrentRound() {
    const currentRound = await this.roundService.getOrCreateCurrentRound();
    this.logger.log(`Current round: ${currentRound.roundId}`);
  }

  /**
   * Get current round configuration
   */
  getRoundConfig() {
    return {
      roundDurationSeconds: this.ROUND_DURATION_SECONDS,
      bettingWindowSeconds: this.BETTING_WINDOW_SECONDS,
    };
  }
}
