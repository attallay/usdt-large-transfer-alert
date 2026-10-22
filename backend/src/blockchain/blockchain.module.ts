import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { UsdtTransferWatcherService } from './usdt-transfer-watcher.service.js';

/** Everything that talks to the Ethereum blockchain. */
@Module({
  imports: [NotificationsModule],
  providers: [UsdtTransferWatcherService],
})
export class BlockchainModule {}
