import { Controller, Post, Body } from '@nestjs/common';
import { BetService } from '../services/bet.service';
import { PlaceBetDto } from '../dto/place-bet.dto';

@Controller('bets')
export class BetController {
  constructor(private readonly betService: BetService) {}

  @Post()
  async placeBet(@Body() dto: PlaceBetDto) {
    return this.betService.placeBet(dto);
  }
}
