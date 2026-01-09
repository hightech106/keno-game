import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RoundService } from '../../round/services/round.service';
import { BetService } from '../../bet/services/bet.service';
import { OperatorService } from '../../operator/services/operator.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from '../../database/entities/bet.entity';
import { Round } from '../../database/entities/round.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentOperator } from '../../auth/decorators/current-operator.decorator';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard) // Admin endpoints require authentication
export class AdminController {
  constructor(
    private readonly roundService: RoundService,
    private readonly betService: BetService,
    private readonly operatorService: OperatorService,
    @InjectRepository(Round)
    private readonly roundRepository: Repository<Round>,
    @InjectRepository(Bet)
    private readonly betRepository: Repository<Bet>,
  ) {}

  /**
   * Get recent rounds
   * GET /admin/rounds?limit=20
   */
  @Get('rounds')
  async getRecentRounds(
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
  ) {
    const limitNum = parseInt(limit, 10) || 20;
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    const rounds = await this.roundRepository.find({
      where,
      order: { scheduledTime: 'DESC' },
      take: limitNum,
    });

    return rounds.map(round => ({
      roundId: round.roundId,
      status: round.status,
      scheduledTime: round.scheduledTime,
      openTime: round.openTime,
      closeTime: round.closeTime,
      drawTime: round.drawTime,
      numbersDrawn: round.numbersDrawn || [],
      totalBet: Number(round.totalBet),
      totalPayout: Number(round.totalPayout),
      resultPublished: round.resultPublished,
    }));
  }

  /**
   * Get round details
   * GET /admin/rounds/:roundId
   */
  @Get('rounds/:roundId')
  async getRoundDetails(@Param('roundId') roundId: string) {
    const round = await this.roundService.getRoundById(roundId);
    if (!round) {
      throw new Error('Round not found');
    }

    // Get all bets for this round
    const bets = await this.betRepository.find({
      where: { roundId },
      order: { createdAt: 'DESC' },
    });

    return {
      round: {
        roundId: round.roundId,
        status: round.status,
        scheduledTime: round.scheduledTime,
        numbersDrawn: round.numbersDrawn || [],
        totalBet: Number(round.totalBet),
        totalPayout: Number(round.totalPayout),
        serverSeedHash: round.serverSeedHash,
      },
      bets: bets.map(bet => ({
        betId: bet.betId,
        operatorId: bet.operatorId,
        playerId: bet.playerId,
        betAmount: Number(bet.betAmount),
        selectionCount: bet.selectionCount,
        numbersSelected: bet.numbersSelected,
        hitsCount: bet.hitsCount,
        winAmount: bet.winAmount ? Number(bet.winAmount) : null,
        credited: bet.credited,
        createdAt: bet.createdAt,
      })),
      betCount: bets.length,
      winCount: bets.filter(b => b.winAmount && b.winAmount > 0).length,
    };
  }

  /**
   * Get recent bets
   * GET /admin/bets?limit=50&operatorId=op-1
   */
  @Get('bets')
  async getRecentBets(
    @Query('limit') limit: string = '50',
    @Query('operatorId') operatorId?: string,
    @Query('roundId') roundId?: string,
  ) {
    const limitNum = parseInt(limit, 10) || 50;
    const where: any = {};
    
    if (operatorId) {
      where.operatorId = operatorId;
    }
    if (roundId) {
      where.roundId = roundId;
    }

    const bets = await this.betRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: limitNum,
      relations: ['round'],
    });

    return bets.map(bet => ({
      betId: bet.betId,
      roundId: bet.roundId,
      operatorId: bet.operatorId,
      playerId: bet.playerId,
      betAmount: Number(bet.betAmount),
      selectionCount: bet.selectionCount,
      numbersSelected: bet.numbersSelected,
      hitsCount: bet.hitsCount,
      payoutMultiplier: bet.payoutMultiplier ? Number(bet.payoutMultiplier) : null,
      winAmount: bet.winAmount ? Number(bet.winAmount) : null,
      credited: bet.credited,
      maxWinCapApplied: bet.maxWinCapApplied,
      createdAt: bet.createdAt,
      roundStatus: bet.round?.status,
    }));
  }

  /**
   * Get statistics
   * GET /admin/stats?operatorId=op-1
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get game statistics (GGR, RTP, win rates)' })
  @ApiQuery({ name: 'operatorId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns statistics' })
  async getStatistics(
    @Query('operatorId') operatorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const where: any = {};
    if (operatorId) {
      where.operatorId = operatorId;
    }

    // Get total bets
    const totalBets = await this.betRepository.count({ where });
    
    // Get total bet amount
    const bets = await this.betRepository.find({ where });
    const totalBetAmount = bets.reduce((sum, bet) => sum + Number(bet.betAmount), 0);
    
    // Get total payout
    const totalPayout = bets.reduce((sum, bet) => sum + (bet.winAmount ? Number(bet.winAmount) : 0), 0);
    
    // Get win count
    const winCount = bets.filter(b => b.winAmount && b.winAmount > 0).length;
    
    // Calculate GGR (Gross Gaming Revenue)
    const ggr = totalBetAmount - totalPayout;
    const rtp = totalBetAmount > 0 ? (totalPayout / totalBetAmount) * 100 : 0;

    return {
      totalBets,
      totalBetAmount: Number(totalBetAmount.toFixed(2)),
      totalPayout: Number(totalPayout.toFixed(2)),
      winCount,
      lossCount: totalBets - winCount,
      ggr: Number(ggr.toFixed(2)),
      rtp: Number(rtp.toFixed(2)),
      winRate: totalBets > 0 ? Number(((winCount / totalBets) * 100).toFixed(2)) : 0,
    };
  }

  /**
   * Get operators list
   * GET /admin/operators
   */
  @Get('operators')
  async getOperators() {
    // This would typically require admin permissions
    // For now, return basic operator info
    return {
      message: 'Operator list endpoint - requires admin permissions',
      note: 'Full implementation requires operator repository access',
    };
  }
}
