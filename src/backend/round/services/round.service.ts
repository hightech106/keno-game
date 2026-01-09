import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Round } from '../../database/entities/round.entity';
import { RoundStatus } from '../../common/enums/round-status.enum';
import { RoundLifecycleService } from './round-lifecycle.service';
import { NumberDrawService } from '../../game-engine/services/number-draw.service';
import { FairnessService } from '../../fairness/services/fairness.service';
import { SettlementService } from '../../payout/services/settlement.service';
import { GameGateway } from '../../gateway/game.gateway';
import { AuditLogService } from '../../common/services/audit-log.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Round Service
 * Manages round creation, lifecycle, and state
 */
@Injectable()
export class RoundService {
  private readonly logger = new Logger(RoundService.name);

  constructor(
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
    private readonly lifecycleService: RoundLifecycleService,
    private readonly numberDrawService: NumberDrawService,
    private readonly fairnessService: FairnessService,
    private readonly settlementService: SettlementService,
    private readonly gameGateway: GameGateway,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Create a new round
   */
  async createRound(scheduledTime: Date): Promise<Round> {
    const roundId = this.generateRoundId();
    const serverSeed = this.fairnessService.generateServerSeed();
    const serverSeedHash = this.fairnessService.hashServerSeed(serverSeed);
    
    const round = this.roundRepository.create({
      roundId,
      status: RoundStatus.OPEN,
      scheduledTime,
      openTime: new Date(),
      totalBet: 0,
      totalPayout: 0,
      resultPublished: false,
      serverSeed,
      serverSeedHash,
      nonce: 1,
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
    // Explicitly select serverSeed (which has select: false) since we need it for drawing
    const round = await this.roundRepository.findOne({
      where: { roundId },
      select: [
        'roundId',
        'status',
        'scheduledTime',
        'openTime',
        'closeTime',
        'drawTime',
        'numbersDrawn',
        'serverSeed', // Required for generateDraw
        'serverSeedHash',
        'clientSeed',
        'nonce',
        'totalBet',
        'totalPayout',
        'resultPublished',
        'createdAt',
        'updatedAt',
      ],
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
        // Generate numbers when entering DRAWING state using Fairness Service
        
        // Ensure serverSeed exists (should always be set on creation, but handle legacy rounds)
        if (!round.serverSeed) {
          // Legacy round without serverSeed - generate one (not provably fair, but allows system to continue)
          this.logger.warn(`Round ${roundId} missing serverSeed. Generating fallback seed (not provably fair).`);
          round.serverSeed = this.fairnessService.generateServerSeed();
          // Generate hash for consistency
          if (!round.serverSeedHash) {
            round.serverSeedHash = this.fairnessService.hashServerSeed(round.serverSeed);
          }
        }
        
        // Ensure client seed is set (simulate if missing)
        if (!round.clientSeed) {
          // In a real environment, this would be set by external event or API
          // For now, we generate a random one to ensure the draw can proceed
          round.clientSeed = this.fairnessService.generateServerSeed().substring(0, 32);
        }
        
        // Ensure nonce is set
        if (!round.nonce || round.nonce === 0) {
          round.nonce = 1;
        }
        
        round.numbersDrawn = this.fairnessService.generateDraw(
          round.serverSeed,
          round.clientSeed,
          round.nonce
        );
        break;
      case RoundStatus.SETTLING:
        // Settlement happens here
        await this.settlementService.settleRound(round);
        break;
      case RoundStatus.PAYOUT:
        // Payout happens here
        break;
      case RoundStatus.ARCHIVED:
        round.resultPublished = true;
        break;
    }

    round.status = updatedStatus;
    const savedRound = await this.roundRepository.save(round);

    // Audit log state change
    await this.auditLogService.logRoundStateChange(
      roundId,
      round.status,
      updatedStatus,
    );

    // Emit real-time events
    this.gameGateway.emitRoundStateChange(
      savedRound.roundId,
      savedRound.status,
      savedRound.scheduledTime,
    );

    if (updatedStatus === RoundStatus.DRAWING) {
      this.gameGateway.emitDrawNumbers(
        savedRound.roundId,
        savedRound.numbersDrawn,
      );
    }

    if (updatedStatus === RoundStatus.ARCHIVED) {
      this.gameGateway.emitRoundSettled(savedRound.roundId);
    }

    return savedRound;
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
