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
  ) {}

  async placeBet(dto: PlaceBetDto): Promise<Bet> {
    const { operatorId, playerId, currency, stake, selections } = dto;

    // 1. Get Current Round
    const round = await this.roundService.getOrCreateCurrentRound();
    if (round.status !== RoundStatus.OPEN) {
      throw new BadRequestException('Round is not open for betting');
    }

    // 2. Validate Operator Config
    const config = await this.operatorService.getConfig(operatorId);
    if (!config.enabled) {
      throw new BadRequestException('Operator is disabled');
    }
    if (stake < config.minBet || stake > config.maxBet) {
      throw new BadRequestException(`Stake must be between ${config.minBet} and ${config.maxBet}`);
    }

    // Validate Selections (Unique Check)
    if (new Set(selections).size !== selections.length) {
      throw new BadRequestException('Duplicate numbers in selection');
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
      throw new BadRequestException(`Wallet debit failed: ${debitResult.error}`);
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
    
    this.logger.log(`Bet placed: ${savedBet.betId} for Round ${round.roundId}, Stake: ${stake}, Selections: ${sortedSelections.join(',')}`);
    return savedBet;
  }
}
