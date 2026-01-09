import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * Audit Log Service
 * 
 * Logs all critical operations for regulatory compliance
 * In production, this would write to a dedicated audit log table or external system
 */
export interface AuditLogEntry {
  timestamp: Date;
  operatorId?: string;
  playerId?: string;
  roundId?: string;
  betId?: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  requestId?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    // In production, inject audit log repository
    // @InjectRepository(AuditLog)
    // private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log a critical operation
   */
  async log(entry: AuditLogEntry): Promise<void> {
    // In production, save to database
    // await this.auditLogRepository.save({
    //   ...entry,
    //   createdAt: entry.timestamp,
    // });

    // For now, log to console (in production, use structured logging)
    this.logger.log(`[AUDIT] ${entry.action}`, {
      operatorId: entry.operatorId,
      playerId: entry.playerId,
      roundId: entry.roundId,
      betId: entry.betId,
      details: entry.details,
      requestId: entry.requestId,
    });
  }

  /**
   * Log bet placement
   */
  async logBetPlacement(
    operatorId: string,
    playerId: string,
    roundId: string,
    betId: string,
    stake: number,
    selections: number[],
    requestId?: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      timestamp: new Date(),
      operatorId,
      playerId,
      roundId,
      betId,
      action: 'BET_PLACED',
      details: {
        stake,
        selections,
        selectionCount: selections.length,
      },
      ipAddress,
      requestId,
    });
  }

  /**
   * Log bet settlement
   */
  async logBetSettlement(
    operatorId: string,
    playerId: string,
    roundId: string,
    betId: string,
    hits: number,
    winAmount: number,
    requestId?: string,
  ): Promise<void> {
    await this.log({
      timestamp: new Date(),
      operatorId,
      playerId,
      roundId,
      betId,
      action: 'BET_SETTLED',
      details: {
        hits,
        winAmount,
        isWin: winAmount > 0,
      },
      requestId,
    });
  }

  /**
   * Log round state change
   */
  async logRoundStateChange(
    roundId: string,
    oldStatus: string,
    newStatus: string,
    requestId?: string,
  ): Promise<void> {
    await this.log({
      timestamp: new Date(),
      roundId,
      action: 'ROUND_STATE_CHANGE',
      details: {
        oldStatus,
        newStatus,
      },
      requestId,
    });
  }

  /**
   * Log wallet operation
   */
  async logWalletOperation(
    operatorId: string,
    playerId: string,
    operation: 'DEBIT' | 'CREDIT' | 'ROLLBACK',
    amount: number,
    currency: string,
    referenceId: string,
    success: boolean,
    error?: string,
    requestId?: string,
  ): Promise<void> {
    await this.log({
      timestamp: new Date(),
      operatorId,
      playerId,
      action: `WALLET_${operation}`,
      details: {
        amount,
        currency,
        referenceId,
        success,
        error,
      },
      requestId,
    });
  }
}
