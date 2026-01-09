import { Controller, Post, Get, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { BetService } from '../services/bet.service';
import { PlaceBetDto } from '../dto/place-bet.dto';

@ApiTags('Bets')
@Controller('bets')
export class BetController {
  constructor(private readonly betService: BetService) {}

  /**
   * Place a bet
   * POST /bets
   */
  @Post()
  @ApiOperation({ summary: 'Place a bet on current round' })
  @ApiBody({ type: PlaceBetDto })
  @ApiResponse({ status: 201, description: 'Bet placed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid bet request' })
  async placeBet(@Body() dto: PlaceBetDto) {
    return this.betService.placeBet(dto);
  }

  /**
   * Get bet by ID
   * GET /bets/:betId
   */
  @Get(':betId')
  @ApiOperation({ summary: 'Get bet status and details' })
  @ApiParam({ name: 'betId', description: 'Bet identifier' })
  @ApiResponse({ status: 200, description: 'Returns bet details' })
  @ApiResponse({ status: 404, description: 'Bet not found' })
  async getBetById(@Param('betId') betId: string) {
    const bet = await this.betService.getBetById(betId);
    
    if (!bet) {
      throw new NotFoundException(`Bet ${betId} not found`);
    }

    // Determine bet status
    let status = 'PENDING';
    if (bet.credited) {
      status = bet.winAmount && bet.winAmount > 0 ? 'WIN' : 'LOST';
    } else if (bet.hitsCount !== null) {
      status = bet.winAmount && bet.winAmount > 0 ? 'WIN' : 'LOST';
    }

    return {
      betId: bet.betId,
      roundId: bet.roundId,
      operatorId: bet.operatorId,
      playerId: bet.playerId,
      betAmount: Number(bet.betAmount),
      selectionCount: bet.selectionCount,
      numbersSelected: bet.numbersSelected,
      status,
      hitsCount: bet.hitsCount,
      payoutMultiplier: bet.payoutMultiplier ? Number(bet.payoutMultiplier) : null,
      winAmount: bet.winAmount ? Number(bet.winAmount) : null,
      credited: bet.credited,
      maxWinCapApplied: bet.maxWinCapApplied,
      createdAt: bet.createdAt,
      updatedAt: bet.updatedAt,
    };
  }

  /**
   * Rollback a bet
   * POST /bets/rollback
   */
  @Post('rollback')
  @ApiOperation({ summary: 'Rollback a bet (refund stake)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        betId: { type: 'string', example: 'BET-123' },
        reason: { type: 'string', example: 'MANUAL_ROLLBACK' },
      },
      required: ['betId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Bet rolled back successfully' })
  @ApiResponse({ status: 400, description: 'Invalid rollback request' })
  async rollbackBet(
    @Body() body: { betId: string; reason?: string },
  ) {
    const { betId, reason = 'MANUAL_ROLLBACK' } = body;
    return this.betService.rollbackBet(betId, reason);
  }
}
