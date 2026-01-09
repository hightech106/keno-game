import { Injectable, Logger } from '@nestjs/common';
import { WalletProvider, WalletTransactionResult } from '../interfaces/wallet-provider.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MockWalletService implements WalletProvider {
  private readonly logger = new Logger(MockWalletService.name);
  
  // In-memory balance store for testing
  private balances: Map<string, number> = new Map();

  constructor() {
    // Seed some test users
    this.balances.set('test-user-1', 1000.00);
    this.balances.set('test-user-2', 500.00);
  }

  async getBalance(userId: string, currency: string): Promise<number> {
    this.logger.debug(`Getting balance for user ${userId} (${currency})`);
    return this.balances.get(userId) || 0;
  }

  async debit(userId: string, amount: number, currency: string, referenceId: string): Promise<WalletTransactionResult> {
    this.logger.debug(`Debiting ${amount} ${currency} from user ${userId} (Ref: ${referenceId})`);
    
    const currentBalance = await this.getBalance(userId, currency);
    
    if (currentBalance < amount) {
      return {
        success: false,
        transactionId: uuidv4(),
        newBalance: currentBalance,
        currency,
        error: 'Insufficient funds',
      };
    }

    const newBalance = currentBalance - amount;
    this.balances.set(userId, newBalance);

    return {
      success: true,
      transactionId: uuidv4(),
      newBalance,
      currency,
    };
  }

  async credit(userId: string, amount: number, currency: string, referenceId: string): Promise<WalletTransactionResult> {
    this.logger.debug(`Crediting ${amount} ${currency} to user ${userId} (Ref: ${referenceId})`);
    
    const currentBalance = await this.getBalance(userId, currency);
    const newBalance = currentBalance + amount;
    this.balances.set(userId, newBalance);

    return {
      success: true,
      transactionId: uuidv4(),
      newBalance,
      currency,
    };
  }
}
