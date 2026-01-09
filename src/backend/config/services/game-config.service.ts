import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Game Configuration Service
 * Manages game-specific configuration settings
 */
@Injectable()
export class GameConfigService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get round duration in seconds
   */
  getRoundDurationSeconds(): number {
    return this.configService.get<number>('ROUND_DURATION_SECONDS', 10);
  }

  /**
   * Get betting window duration in seconds
   */
  getBettingWindowSeconds(): number {
    return this.configService.get<number>('BETTING_WINDOW_SECONDS', 8);
  }

  /**
   * Get default min bet
   */
  getDefaultMinBet(): number {
    return this.configService.get<number>('DEFAULT_MIN_BET', 1.0);
  }

  /**
   * Get default max bet
   */
  getDefaultMaxBet(): number {
    return this.configService.get<number>('DEFAULT_MAX_BET', 1000.0);
  }

  /**
   * Get default max win per ticket
   */
  getDefaultMaxWinPerTicket(): number {
    return this.configService.get<number>('DEFAULT_MAX_WIN_PER_TICKET', 100000.0);
  }

  /**
   * Get target RTP percentage
   */
  getTargetRTP(): number {
    return this.configService.get<number>('TARGET_RTP', 88.5);
  }

  /**
   * Get target house edge percentage
   */
  getTargetHouseEdge(): number {
    return this.configService.get<number>('TARGET_HOUSE_EDGE', 11.5);
  }
}
