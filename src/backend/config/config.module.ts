import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { GameConfigService } from './services/game-config.service';

@Module({
  imports: [NestConfigModule],
  providers: [GameConfigService],
  exports: [GameConfigService],
})
export class ConfigModule {}
