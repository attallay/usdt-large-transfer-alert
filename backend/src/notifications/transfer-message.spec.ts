import type { LargeTransfer } from '../blockchain/usdt-transfer.js';
import {
  buildTransferMessage,
  isLanguage,
  shortenHex,
} from './transfer-message.js';

const TX_HASH = `0x${'ab'.repeat(32)}` as const;

function largeTransfer(amount: string): LargeTransfer {
  return {
    from: '0x7F0F90a1F8529cC0b2Dee43A51F69203Bdf9632F',
    to: '0xfB19085AC3951cB0AF7B5A6126F4bfF8E2D1F8eE',
    amount,
    txHash: TX_HASH,
    blockNumber: 26_243_247n,
  };
}

describe('buildTransferMessage', () => {
  it('includes every transfer detail as text data for the app', () => {
    const message = buildTransferMessage(largeTransfer('107689.108135'), 'en');
    expect(message.data).toEqual({
      fromAddress: '0x7F0F90a1F8529cC0b2Dee43A51F69203Bdf9632F',
      toAddress: '0xfB19085AC3951cB0AF7B5A6126F4bfF8E2D1F8eE',
      amount: '107689.108135',
      txHash: TX_HASH,
      blockNumber: '26243247',
    });
  });

  it('avoids the data key names that FCM reserves', () => {
    const message = buildTransferMessage(largeTransfer('4000000'), 'en');
    for (const key of Object.keys(message.data ?? {})) {
      expect(['from', 'message_type', 'notification']).not.toContain(key);
      expect(key).not.toMatch(/^(google|gcm)/);
    }
  });

  it('writes the system notification in Turkish: amount, sender → receiver, transaction hash', () => {
    const message = buildTransferMessage(largeTransfer('107689.108135'), 'tr');
    expect(message.webpush?.notification?.title).toBe(
      '107.689,11 USDT transfer edildi',
    );
    expect(message.webpush?.notification?.body).toBe(
      '0x7F0F…632F → 0xfB19…F8eE\nİşlem: 0xabab…abab',
    );
  });

  it('writes the system notification in English: amount, sender → receiver, transaction hash', () => {
    const message = buildTransferMessage(largeTransfer('107689.108135'), 'en');
    expect(message.webpush?.notification?.title).toBe(
      '107,689.11 USDT transferred',
    );
    expect(message.webpush?.notification?.body).toBe(
      '0x7F0F…632F → 0xfB19…F8eE\nTx: 0xabab…abab',
    );
  });

  it('uses one shared tag, so new notifications replace older ones', () => {
    const first = buildTransferMessage(largeTransfer('4000000'), 'en');
    const second = buildTransferMessage(largeTransfer('250000'), 'tr');
    expect(first.webpush?.notification?.tag).toBe(
      second.webpush?.notification?.tag,
    );
  });

  it('opens the transaction on Etherscan when the notification is clicked', () => {
    const message = buildTransferMessage(largeTransfer('4000000'), 'en');
    expect(message.webpush?.fcmOptions?.link).toBe(
      `https://etherscan.io/tx/${TX_HASH}`,
    );
  });
});

describe('isLanguage', () => {
  it('accepts only the supported languages', () => {
    expect(isLanguage('en')).toBe(true);
    expect(isLanguage('tr')).toBe(true);
    expect(isLanguage('de')).toBe(false);
    expect(isLanguage(undefined)).toBe(false);
  });
});

describe('shortenHex', () => {
  it('keeps the first 6 and last 4 characters of addresses and hashes', () => {
    expect(shortenHex('0x7F0F90a1F8529cC0b2Dee43A51F69203Bdf9632F')).toBe(
      '0x7F0F…632F',
    );
    expect(shortenHex(TX_HASH)).toBe('0xabab…abab');
  });
});
