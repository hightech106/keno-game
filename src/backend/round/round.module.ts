import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Round } from '../database/entities/round.entity';
import { RoundService } from './services/round.service';
import { RoundLifecycleService } from './services/round-lifecycle.service';
import { GameEngineModule } from '../game-engine/game-engine.module';
import { PayoutModule } from '../payout/payout.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Round]),
    GameEngineModule,
    PayoutModule,
  ],
  providers: [RoundService, RoundLifecycleService],
  exports: [RoundService, RoundLifecycleService],
})
export class RoundModule {}
