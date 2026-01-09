import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Operator } from '../../database/entities/operator.entity';
import { OperatorConfig } from '../../database/entities/operator-config.entity';


@Injectable()
export class OperatorService {
  constructor(
    @InjectRepository(Operator)
    private readonly operatorRepository: Repository<Operator>,
    @InjectRepository(OperatorConfig)
    private readonly configRepository: Repository<OperatorConfig>,
  ) {}

  async getOperator(operatorId: string): Promise<Operator> {
    const operator = await this.operatorRepository.findOne({
      where: { operatorId },
    });

    if (!operator) {
      throw new NotFoundException(`Operator ${operatorId} not found`);
    }

    return operator;
  }

  async getConfig(operatorId: string): Promise<OperatorConfig> {
    const config = await this.configRepository.findOne({
      where: { operatorId },
    });

    if (!config) {
      // Return defaults if no specific config exists
      return this.createDefaultConfig(operatorId);
    }

    return config;
  }

  private createDefaultConfig(operatorId: string): OperatorConfig {
    const config = new OperatorConfig();
    config.operatorId = operatorId;
    config.minBet = 1.0;
    config.maxBet = 100.0;
    config.maxWinPerTicket = 10000.0;
    config.volatilityMode = 'medium';
    config.defaultLanguage = 'en';
    config.houseEdgeTarget = 11.0;
    config.enabled = true;
    return config;
  }
}
