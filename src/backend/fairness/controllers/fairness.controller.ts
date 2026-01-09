import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { FairnessService } from '../services/fairness.service';

@Controller('fairness')
export class FairnessController {
  constructor(private readonly fairnessService: FairnessService) {}

  @Get('verify')
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
