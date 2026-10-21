import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { SubscriptionsController } from './subscriptions.controller.js';

/** Everything that talks to Firebase Cloud Messaging. */
@Module({
  controllers: [SubscriptionsController],
  providers: [NotificationsService],
  // Lets other modules (the blockchain watcher) use NotificationsService.
  exports: [NotificationsService],
})
export class NotificationsModule {}
