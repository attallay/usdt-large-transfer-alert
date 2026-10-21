import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { EnvConfig } from './config/env.validation.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config: ConfigService<EnvConfig, true> = app.get(ConfigService);
  // Browsers only let the frontend call this backend if the backend allows the frontend's address.
  app.enableCors({ origin: config.get('FRONTEND_ORIGIN', { infer: true }) });
  // Lets services clean up (e.g. stop watching the blockchain) when you press Ctrl+C.
  app.enableShutdownHooks();
  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  new Logger('Bootstrap').log(`Backend listening on http://localhost:${port}`);
}
await bootstrap();
