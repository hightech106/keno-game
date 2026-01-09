import { Module } from '@nestjs/common';
import { MockWalletService } from './services/mock-wallet.service';

@Module({
  providers: [
    {
      provide: 'WALLET_PROVIDER',
      useClass: MockWalletService,
    },
  ],
  exports: ['WALLET_PROVIDER'],
})
export class WalletModule {}
