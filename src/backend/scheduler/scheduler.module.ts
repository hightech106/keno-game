import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RoundSchedulerService } from './services/round-scheduler.service';
import { RoundModule } from '../round/round.module';

@Module({
  imports: [ScheduleModule.forRoot(), RoundModule],
  providers: [RoundSchedulerService],
  exports: [RoundSchedulerService],
})
export class SchedulerModule {}
