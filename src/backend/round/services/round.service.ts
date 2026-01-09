import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Round } from '../../database/entities/round.entity';
import { RoundStatus } from '../../common/enums/round-status.enum';
import { RoundLifecycleService } from './round-lifecycle.service';
import { NumberDrawService } from '../../game-engine/services/number-draw.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Round Service
 * Manages round creation, lifecycle, and state
 */
@Injectable()
export class RoundService {
  constructor(
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
    private readonly lifecycleService: RoundLifecycleService,
    private readonly numberDrawService: NumberDrawService,
  ) {}

  /**
   * Create a new round
   */
  async createRound(scheduledTime: Date): Promise<Round> {
    const roundId = this.generateRoundId();
    
    const round = this.roundRepository.create({
      roundId,
      status: RoundStatus.OPEN,
      scheduledTime,
      openTime: new Date(),
      totalBet: 0,
      totalPayout: 0,
      resultPublished: false,
    });

    return await this.roundRepository.save(round);
  }

  /**
   * Get current open round or create new one
   */
  async getOrCreateCurrentRound(): Promise<Round> {
    const currentRound = await this.roundRepository.findOne({
      where: { status: RoundStatus.OPEN },
      order: { scheduledTime: 'DESC' },
    });

    if (currentRound) {
      return currentRound;
    }

    // Create new round starting now
    const scheduledTime = new Date();
    return await this.createRound(scheduledTime);
  }

  /**
   * Transition round to next state
   */
  async transitionRound(
    roundId: string,
    newStatus: RoundStatus,
  ): Promise<Round> {
    const round = await this.roundRepository.findOne({
      where: { roundId },
    });

    if (!round) {
      throw new Error(`Round not found: ${roundId}`);
    }

    const updatedStatus = this.lifecycleService.transition(
      round.status,
      newStatus,
    );

    // Update timestamps based on status
    const now = new Date();
    switch (updatedStatus) {
      case RoundStatus.CLOSING:
        round.closeTime = now;
        break;
      case RoundStatus.DRAWING:
        round.drawTime = now;
        // Generate numbers when entering DRAWING state
        round.numbersDrawn = this.numberDrawService.generateDrawNumbers();
        break;
      case RoundStatus.SETTLING:
        // Settlement happens here
        break;
      case RoundStatus.PAYOUT:
        // Payout happens here
        break;
      case RoundStatus.ARCHIVED:
        round.resultPublished = true;
        break;
    }

    round.status = updatedStatus;
    return await this.roundRepository.save(round);
  }

  /**
   * Get round by ID
   */
  async getRoundById(roundId: string): Promise<Round | null> {
    return await this.roundRepository.findOne({
      where: { roundId },
    });
  }

  /**
   * Generate unique round ID
   * Format: YYYYMMDD-HHMMSS-XXXX
   */
  private generateRoundId(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const unique = uuidv4().substring(0, 4).toUpperCase();
    return `${dateStr}-${timeStr}-${unique}`;
  }

  /**
   * Update round bet/payout totals
   */
  async updateRoundTotals(
    roundId: string,
    betDelta: number,
    payoutDelta: number,
  ): Promise<void> {
    // await this.roundRepository.increment(
    //   { roundId },
    //   { totalBet: betDelta, totalPayout: payoutDelta },
    // );
    await this.roundRepository.increment(
      {roundId},
      'totalBet',
      betDelta,
    );
    await this.roundRepository.increment(
      {roundId},
      'totalPayout',
      payoutDelta,
    );
  }
}
