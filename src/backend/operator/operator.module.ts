import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operator } from '../database/entities/operator.entity';
import { OperatorConfig } from '../database/entities/operator-config.entity';
import { OperatorService } from './services/operator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Operator, OperatorConfig]),
  ],
  providers: [OperatorService],
  exports: [OperatorService],
})
export class OperatorModule {}
