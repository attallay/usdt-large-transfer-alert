import type { BaseMessage } from 'firebase-admin/messaging';
import type { LargeTransfer } from '../blockchain/usdt-transfer.js';

/** Languages the notification text is written in. Browsers tell us theirs when they subscribe. */
export const LANGUAGES = ['en', 'tr'] as const;
export type Language = (typeof LANGUAGES)[number];

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language);
}

const NOTIFICATION_TEXTS: Record<
  Language,
  {
    amount: Intl.NumberFormat;
    title: (amount: string) => string;
    txLabel: string;
  }
> = {
  en: {
    amount: new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }),
    title: (amount) => `${amount} USDT transferred`,
    txLabel: 'Tx',
  },
  tr: {
    amount: new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }),
    title: (amount) => `${amount} USDT transfer edildi`,
    txLabel: 'İşlem',
  },
};

/** Notifications with the same tag replace each other instead of piling up on screen. */
const NOTIFICATION_TAG = 'large-usdt-transfer';

/** If a browser is offline for longer than this, the alert is dropped: old alerts are not useful. */
const TIME_TO_LIVE_SECONDS = 300;

/**
 * Builds the content of the FCM message for one large transfer (the receivers are added when
 * sending). It carries the transfer details as data for the app, plus a ready-made notification,
 * in the given language, that the browser shows when the app is in the background.
 */
export function buildTransferMessage(
  transfer: LargeTransfer,
  language: Language,
): BaseMessage {
  const texts = NOTIFICATION_TEXTS[language];
  return {
    // FCM only accepts text values here, and reserves some key names (e.g. "from").
    data: {
      fromAddress: transfer.from,
      toAddress: transfer.to,
      amount: transfer.amount,
      txHash: transfer.txHash,
      blockNumber: transfer.blockNumber.toString(),
    },
    webpush: {
      headers: { TTL: String(TIME_TO_LIVE_SECONDS) },
      // The system notification: amount, sender → receiver, and the transaction hash.
      notification: {
        title: texts.title(texts.amount.format(Number(transfer.amount))),
        body: `${shortenHex(transfer.from)} → ${shortenHex(transfer.to)}\n${texts.txLabel}: ${shortenHex(transfer.txHash)}`,
        tag: NOTIFICATION_TAG,
      },
      // Clicking the notification opens the transaction on Etherscan.
      fcmOptions: { link: `https://etherscan.io/tx/${transfer.txHash}` },
    },
  };
}

/** Shortens an address or hash for small spaces: "0x7F0F90a1…9632F" -> "0x7F0F…632F" */
export function shortenHex(value: string): string {
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
