import { Module } from '@nestjs/common';
import { NumberDrawService } from './services/number-draw.service';
import { HitDetectionService } from './services/hit-detection.service';

@Module({
  providers: [NumberDrawService, HitDetectionService],
  exports: [NumberDrawService, HitDetectionService],
})
export class GameEngineModule {}
