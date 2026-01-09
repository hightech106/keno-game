export interface WalletTransactionResult {
  success: boolean;
  transactionId: string;
  newBalance: number;
  currency: string;
  error?: string;
}

export interface WalletProvider {
  getBalance(userId: string, currency: string): Promise<number>;
  debit(userId: string, amount: number, currency: string, referenceId: string): Promise<WalletTransactionResult>;
  credit(userId: string, amount: number, currency: string, referenceId: string): Promise<WalletTransactionResult>;
}
