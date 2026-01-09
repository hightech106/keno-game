import { Module } from '@nestjs/common';
import { FairnessService } from './services/fairness.service';
import { FairnessController } from './controllers/fairness.controller';

@Module({
  controllers: [FairnessController],
  providers: [FairnessService],
  exports: [FairnessService],
})
export class FairnessModule {}
