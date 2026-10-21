import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { LANGUAGES, isLanguage } from './transfer-message.js';

/** FCM registration tokens are long strings of letters, digits, '_', '-' and ':'. */
const TOKEN_PATTERN = /^[\w:-]{20,4096}$/;

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly notifications: NotificationsService) {}

  /**
   * POST /subscriptions with a JSON body like {"token": "...", "language": "tr"}, where token is
   * the browser's FCM registration token and language (optional, default "en") is the language
   * of its notifications. The frontend calls this so that browser starts receiving alerts.
   */
  @Post()
  async subscribe(@Body() body: unknown): Promise<{ subscribed: true }> {
    const { token, language = 'en' } = (body ?? {}) as {
      token?: unknown;
      language?: unknown;
    };
    if (typeof token !== 'string' || !TOKEN_PATTERN.test(token)) {
      throw new BadRequestException(
        'Expected a JSON body with a "token" field holding an FCM registration token',
      );
    }
    if (!isLanguage(language)) {
      throw new BadRequestException(
        `"language" must be one of: ${LANGUAGES.join(', ')}`,
      );
    }
    await this.notifications.addSubscriber(token, language);
    return { subscribed: true };
  }
}
