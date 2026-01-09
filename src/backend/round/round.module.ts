import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoundService } from './services/round.service';
import { RoundLifecycleService } from './services/round-lifecycle.service';
import { RoundController } from './controllers/round.controller';
import { Round } from '../database/entities/round.entity';
import { GameEngineModule } from '../game-engine/game-engine.module';
import { FairnessModule } from '../fairness/fairness.module';
import { PayoutModule } from '../payout/payout.module';
import { GatewayModule } from '../gateway/gateway.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Round]),
    GameEngineModule,
    FairnessModule,
    forwardRef(() => PayoutModule),
    GatewayModule,
    CommonModule,
  ],
  controllers: [RoundController],
  providers: [RoundService, RoundLifecycleService],
  exports: [RoundService, RoundLifecycleService],
})
export class RoundModule {}
