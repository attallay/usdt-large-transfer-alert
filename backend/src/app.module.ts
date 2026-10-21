import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { validateEnv } from './config/env.validation.js';
import { NotificationsModule } from './notifications/notifications.module.js';

@Module({
  imports: [
    // Loads backend/.env, checks it with validateEnv, and shares ConfigService with every module.
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
