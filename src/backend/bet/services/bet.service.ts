import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from '../../database/entities/bet.entity';
import { PlaceBetDto } from '../dto/place-bet.dto';
import { WalletProvider } from '../../wallet/interfaces/wallet-provider.interface';
import { OperatorService } from '../../operator/services/operator.service';
import { RoundService } from '../../round/services/round.service';
import { PayoutTableService } from '../../payout/services/payout-table.service';
import { PayoutCalculationService } from '../../payout/services/payout-calculation.service';
import { RoundStatus } from '../../common/enums/round-status.enum';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { AuditLogService } from '../../common/services/audit-log.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BetService {
  private readonly logger = new Logger(BetService.name);

  constructor(
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,
    @Inject('WALLET_PROVIDER')
    private readonly walletProvider: WalletProvider,
    private readonly operatorService: OperatorService,
    private readonly roundService: RoundService,
    private readonly payoutTableService: PayoutTableService,
    private readonly payoutCalcService: PayoutCalculationService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async placeBet(dto: PlaceBetDto): Promise<Bet> {
    const { operatorId, playerId, currency, stake, selections } = dto;

    // 1. Get Current Round
    const round = await this.roundService.getOrCreateCurrentRound();
    if (round.status !== RoundStatus.OPEN) {
      const error = new BadRequestException('Round is not open for betting');
      (error as any).errorCode = ErrorCode.ERR_ROUND_CLOSED;
      throw error;
    }

    // 2. Validate Operator Config
    const config = await this.operatorService.getConfig(operatorId);
    if (!config.enabled) {
      const error = new BadRequestException('Operator is disabled');
      (error as any).errorCode = ErrorCode.ERR_AUTH_OPERATOR_BLOCKED;
      throw error;
    }
    if (stake < config.minBet || stake > config.maxBet) {
      const errorCode = stake < config.minBet 
        ? ErrorCode.ERR_BET_AMOUNT_TOO_LOW 
        : ErrorCode.ERR_BET_AMOUNT_TOO_HIGH;
      const error = new BadRequestException(`Stake must be between ${config.minBet} and ${config.maxBet}`);
      (error as any).errorCode = errorCode;
      throw error;
    }

    // Validate Selections (Unique Check)
    if (new Set(selections).size !== selections.length) {
      const error = new BadRequestException('Duplicate numbers in selection');
      (error as any).errorCode = ErrorCode.ERR_BET_SELECTION_DUPLICATE;
      throw error;
    }

    // 3. Calculate Potential Win (to check against limits)
    // Get maximum possible multiplier for this pick count
    const payoutTable = this.payoutTableService.getPayoutTableForPick(selections.length);
    const maxMultiplier = Math.max(...Object.values(payoutTable));
    const potentialWin = stake * maxMultiplier;
    
    if (potentialWin > config.maxWinPerTicket) {
      // In a real scenario we might reject or cap the bet. For now, we allow it but payout will be capped.
      this.logger.warn(`Potential win ${potentialWin} exceeds maxWinPerTicket ${config.maxWinPerTicket} for bet`);
    }

    // 4. Debit Wallet
    const debitResult = await this.walletProvider.debit(playerId, stake, currency, round.roundId);
    if (!debitResult.success) {
      const error = new BadRequestException(`Wallet debit failed: ${debitResult.error}`);
      (error as any).errorCode = ErrorCode.ERR_WALLET_REJECTED;
      throw error;
    }

    // 5. Create Bet Entity
    const betId = `BET-${uuidv4()}`;
    const sortedSelections = selections.sort((a, b) => a - b);
    
    const bet = this.betRepository.create({
      betId,
      roundId: round.roundId,
      operatorId,
      playerId,
      betAmount: stake,
      selectionCount: selections.length,
      numbersSelected: sortedSelections,
      // hitsCount, payoutMultiplier, winAmount will be set during settlement
      credited: false,
      maxWinCapApplied: false,
    });

    const savedBet = await this.betRepository.save(bet);

    // 6. Update Round Totals (atomically)
    await this.roundService.updateRoundTotals(round.roundId, stake, 0);
    
    // 7. Audit log
    await this.auditLogService.logBetPlacement(
      operatorId,
      playerId,
      round.roundId,
      savedBet.betId,
      stake,
      sortedSelections,
    );
    
    this.logger.log(`Bet placed: ${savedBet.betId} for Round ${round.roundId}, Stake: ${stake}, Selections: ${sortedSelections.join(',')}`);
    return savedBet;
  }

  /**
   * Get bet by ID
   */
  async getBetById(betId: string): Promise<Bet | null> {
    return await this.betRepository.findOne({
      where: { betId },
      relations: ['round'],
    });
  }

  /**
   * Rollback a bet (for failures, cancellations, etc.)
   */
  async rollbackBet(betId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const bet = await this.betRepository.findOne({
      where: { betId },
    });

    if (!bet) {
      throw new BadRequestException(`Bet ${betId} not found`);
    }

    // Check if bet can be rolled back (not yet settled)
    if (bet.credited) {
      throw new BadRequestException(`Bet ${betId} has already been settled and cannot be rolled back`);
    }

    // Refund the stake to player wallet
    const round = await this.roundService.getRoundById(bet.roundId);
    if (!round) {
      throw new BadRequestException(`Round ${bet.roundId} not found`);
    }

    const operator = await this.operatorService.getOperator(bet.operatorId);
    const currency = operator.defaultCurrency;

    const creditResult = await this.walletProvider.credit(
      bet.playerId,
      bet.betAmount,
      currency,
      `ROLLBACK-${betId}`,
    );

    if (!creditResult.success) {
      throw new BadRequestException(`Wallet credit failed: ${creditResult.error}`);
    }

    // Delete the bet record
    await this.betRepository.remove(bet);

    // Update round totals
    await this.roundService.updateRoundTotals(bet.roundId, -bet.betAmount, 0);

    this.logger.log(`Bet ${betId} rolled back. Reason: ${reason}`);
    
    return {
      success: true,
      message: `Bet ${betId} has been rolled back successfully`,
    };
  }
}
