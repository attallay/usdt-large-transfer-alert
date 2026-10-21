import {
  BadRequestException,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, initializeApp } from 'firebase-admin/app';
import {
  getMessaging,
  type Messaging,
  type SendResponse,
} from 'firebase-admin/messaging';
import { zeroAddress, zeroHash } from 'viem';
import type { LargeTransfer } from '../blockchain/usdt-transfer.js';
import type { EnvConfig } from '../config/env.validation.js';
import {
  LANGUAGES,
  buildTransferMessage,
  type Language,
} from './transfer-message.js';

/** FCM accepts at most this many tokens in one multicast request. */
const MAX_TOKENS_PER_REQUEST = 500;

/** Error codes meaning a token is no longer valid, so we stop sending to it. */
const DEAD_TOKEN_ERRORS = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

/** A made-up transfer, used to check our message format at startup. */
const SAMPLE_TRANSFER: LargeTransfer = {
  from: zeroAddress,
  to: zeroAddress,
  amount: '100000',
  txHash: zeroHash,
  blockNumber: 0n,
};

/**
 * Sends alerts with Firebase Cloud Messaging (FCM) directly to every subscribed browser, in
 * each browser's language. The browsers' tokens are kept in memory only. Open browsers register
 * again every minute, so after a backend restart the list fills up again by itself.
 */
@Injectable()
export class NotificationsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly messaging: Messaging;
  /** Each subscribed browser's FCM registration token, with its language. */
  private readonly subscribers = new Map<string, Language>();

  constructor(config: ConfigService<EnvConfig, true>) {
    const serviceAccountPath = config.get('FIREBASE_SERVICE_ACCOUNT_PATH', {
      infer: true,
    });
    const app = initializeApp({ credential: cert(serviceAccountPath) });
    this.messaging = getMessaging(app);
  }

  /**
   * Checks the Firebase credentials and our message format once at startup, with a "dry run"
   * of a sample alert to a placeholder topic: Firebase validates it but delivers nothing.
   */
  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.messaging.send(
        {
          ...buildTransferMessage(SAMPLE_TRANSFER, 'en'),
          topic: 'startup-check',
        },
        true,
      );
      this.logger.log('Firebase Cloud Messaging is ready');
    } catch (error) {
      this.logger.error(
        `Firebase credentials check failed: ${describeError(error)}`,
      );
    }
  }

  /** Remembers a browser's FCM registration token, after Firebase confirms the token is valid. */
  async addSubscriber(token: string, language: Language): Promise<void> {
    try {
      await this.messaging.send(
        { token, data: { check: 'subscription' } },
        true,
      );
    } catch (error) {
      // Firebase's message can contain the token, which identifies the browser: leave it out.
      const reason = describeError(error).replaceAll(token, '[token]');
      this.logger.warn(`Rejected a subscription: ${reason}`);
      throw new BadRequestException(`Firebase rejected the token (${reason})`);
    }
    const isNew = !this.subscribers.has(token);
    // Set even when known: the browser's language may have changed since last time.
    this.subscribers.set(token, language);
    if (isNew) {
      this.logger.log(
        `A browser subscribed (language: ${language}, ${this.subscribers.size} subscribed)`,
      );
    }
  }

  /** Sends one alert to every subscribed browser. Never throws: failures are only logged. */
  async sendLargeTransfer(transfer: LargeTransfer): Promise<void> {
    const total = this.subscribers.size;
    if (total === 0) {
      this.logger.debug(
        `No browser subscribed, so no notification for tx ${transfer.txHash}`,
      );
      return;
    }
    let delivered = 0;
    try {
      // One message per language, each sent to the browsers using that language.
      for (const language of LANGUAGES) {
        const tokens = this.tokensFor(language);
        const message = buildTransferMessage(transfer, language);
        for (
          let start = 0;
          start < tokens.length;
          start += MAX_TOKENS_PER_REQUEST
        ) {
          const batch = tokens.slice(start, start + MAX_TOKENS_PER_REQUEST);
          const result = await this.messaging.sendEachForMulticast({
            ...message,
            tokens: batch,
          });
          delivered += result.successCount;
          for (const deadToken of findDeadTokens(batch, result.responses)) {
            this.subscribers.delete(deadToken);
          }
        }
      }
      this.logger.debug(
        `Notification for tx ${transfer.txHash} sent to ${delivered} of ${total} browsers`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not send notification for tx ${transfer.txHash}: ${describeError(error)}`,
      );
    }
  }

  private tokensFor(language: Language): string[] {
    return [...this.subscribers]
      .filter(([, subscriberLanguage]) => subscriberLanguage === language)
      .map(([token]) => token);
  }
}

/** Returns the tokens whose send failed because the token itself is no longer valid. */
export function findDeadTokens(
  tokens: string[],
  responses: SendResponse[],
): string[] {
  return tokens.filter((_token, index) => {
    const code = responses[index]?.error?.code;
    return code !== undefined && DEAD_TOKEN_ERRORS.has(code);
  });
}

/** Firebase errors carry a code such as "messaging/invalid-argument"; include it when present. */
function describeError(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }
  const code = (error as { code?: unknown }).code;
  return typeof code === 'string' ? `${code}: ${error.message}` : error.message;
}
