import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { RoundService } from '../services/round.service';
import { Round } from '../../database/entities/round.entity';

@ApiTags('Rounds')
@Controller('rounds')
export class RoundController {
  constructor(private readonly roundService: RoundService) {}

  /**
   * Get current open round
   * GET /rounds/current
   * Public endpoint - no authentication required
   */
  @Public()
  @Get('current')
  @ApiOperation({ summary: 'Get current open round' })
  @ApiResponse({ status: 200, description: 'Returns current round information' })
  async getCurrentRound() {
    const round = await this.roundService.getOrCreateCurrentRound();
    
    // Calculate countdown
    const now = new Date();
    const scheduledTime = new Date(round.scheduledTime);
    const roundDuration = 10 * 1000; // 10 seconds in milliseconds
    const elapsed = now.getTime() - scheduledTime.getTime();
    const countdownSeconds = Math.max(0, Math.ceil((roundDuration - elapsed) / 1000));

    return {
      roundId: round.roundId,
      status: round.status,
      scheduledTime: round.scheduledTime,
      openTime: round.openTime,
      closeTime: round.closeTime,
      drawTime: round.drawTime,
      countdownSeconds,
      serverSeedHash: round.serverSeedHash,
      numbersDrawn: round.numbersDrawn || [],
      totalBet: Number(round.totalBet),
      totalPayout: Number(round.totalPayout),
    };
  }

  /**
   * Get round by ID
   * GET /rounds/:roundId
   */
  @Get(':roundId')
  @ApiOperation({ summary: 'Get round details by ID' })
  @ApiParam({ name: 'roundId', description: 'Round identifier' })
  @ApiResponse({ status: 200, description: 'Returns round details' })
  @ApiResponse({ status: 404, description: 'Round not found' })
  async getRoundById(@Param('roundId') roundId: string) {
    const round = await this.roundService.getRoundById(roundId);
    
    if (!round) {
      throw new NotFoundException(`Round ${roundId} not found`);
    }

    return {
      roundId: round.roundId,
      status: round.status,
      scheduledTime: round.scheduledTime,
      openTime: round.openTime,
      closeTime: round.closeTime,
      drawTime: round.drawTime,
      numbersDrawn: round.numbersDrawn || [],
      serverSeedHash: round.serverSeedHash,
      clientSeed: round.clientSeed,
      nonce: round.nonce,
      totalBet: Number(round.totalBet),
      totalPayout: Number(round.totalPayout),
      resultPublished: round.resultPublished,
    };
  }

  /**
   * Get round result (for completed rounds)
   * GET /rounds/:roundId/result
   * Public endpoint - no authentication required
   */
  @Public()
  @Get(':roundId/result')
  @ApiOperation({ summary: 'Get round results' })
  @ApiParam({ name: 'roundId', description: 'Round identifier' })
  @ApiResponse({ status: 200, description: 'Returns round results' })
  @ApiResponse({ status: 404, description: 'Round not found or results not available' })
  async getRoundResult(@Param('roundId') roundId: string) {
    const round = await this.roundService.getRoundById(roundId);
    
    if (!round) {
      throw new NotFoundException(`Round ${roundId} not found`);
    }

    if (!round.numbersDrawn || round.numbersDrawn.length === 0) {
      throw new NotFoundException(`Round ${roundId} has no results yet`);
    }

    return {
      roundId: round.roundId,
      status: round.status,
      numbersDrawn: round.numbersDrawn,
      serverSeedHash: round.serverSeedHash,
      clientSeed: round.clientSeed,
      nonce: round.nonce,
      totalBet: Number(round.totalBet),
      totalPayout: Number(round.totalPayout),
      drawTime: round.drawTime,
    };
  }
}
