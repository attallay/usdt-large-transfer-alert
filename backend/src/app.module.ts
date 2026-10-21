import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { validateEnv } from './config/env.validation.js';

@Module({
  imports: [
    // Loads backend/.env, checks it with validateEnv, and shares ConfigService with every module.
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
  ],
  controllers: [AppController],
})
export class AppModule {}
