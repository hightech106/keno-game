import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { FairnessService } from '../services/fairness.service';

@ApiTags('Fairness')
@Controller('fairness')
export class FairnessController {
  constructor(private readonly fairnessService: FairnessService) {}

  /**
   * Public fairness verification endpoint
   * No authentication required - anyone can verify round fairness
   */
  @Public()
  @Get('verify')
  @ApiOperation({ summary: 'Verify round fairness using seeds' })
  @ApiQuery({ name: 'serverSeed', description: 'Server seed (revealed after round)', example: 'abc123...' })
  @ApiQuery({ name: 'clientSeed', description: 'Client seed', example: 'client-seed-456' })
  @ApiQuery({ name: 'nonce', description: 'Nonce value', example: 1, type: Number })
  @ApiResponse({ status: 200, description: 'Fairness verification result' })
  @ApiResponse({ status: 400, description: 'Missing required parameters' })
  verify(
    @Query('serverSeed') serverSeed: string,
    @Query('clientSeed') clientSeed: string,
    @Query('nonce') nonce: number,
  ) {
    if (!serverSeed || !clientSeed || nonce === undefined) {
      throw new BadRequestException('Missing required parameters: serverSeed, clientSeed, nonce');
    }

    const numbers = this.fairnessService.generateDraw(serverSeed, clientSeed, Number(nonce));
    const serverSeedHash = this.fairnessService.hashServerSeed(serverSeed);

    return {
      success: true,
      inputs: {
        serverSeed,
        serverSeedHash,
        clientSeed,
        nonce: Number(nonce),
      },
      result: {
        numbers,
      },
    };
  }
}
