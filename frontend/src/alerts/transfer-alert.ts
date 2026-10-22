/** One large USDT transfer, as received from the backend through Firebase. */
export interface TransferAlert {
  /** Unique id for this alert on this page (one transaction can contain several transfers). */
  id: string
  fromAddress: string
  toAddress: string
  /** Exact USDT amount as a decimal string, e.g. "250000.5". */
  amount: string
  txHash: string
  blockNumber: string
  receivedAt: Date
}

/** The most alerts kept on screen. Older ones are dropped so the page stays fast. */
export const MAX_ALERTS = 100

const ADDRESS = /^0x[0-9a-fA-F]{40}$/
const TX_HASH = /^0x[0-9a-fA-F]{64}$/
const AMOUNT = /^\d+(\.\d+)?$/
const BLOCK_NUMBER = /^\d+$/

/** Turns the data of an FCM message into an alert, or null if anything is missing or malformed. */
export function toTransferAlert(
  data: Record<string, string> | undefined,
  receivedAt = new Date(),
): TransferAlert | null {
  if (!data) {
    return null
  }
  const { fromAddress, toAddress, amount, txHash, blockNumber } = data
  const valid =
    ADDRESS.test(fromAddress ?? '') &&
    ADDRESS.test(toAddress ?? '') &&
    AMOUNT.test(amount ?? '') &&
    TX_HASH.test(txHash ?? '') &&
    BLOCK_NUMBER.test(blockNumber ?? '')
  if (!valid) {
    return null
  }
  return { id: crypto.randomUUID(), fromAddress, toAddress, amount, txHash, blockNumber, receivedAt }
}

/** Puts the newest alert first and keeps at most MAX_ALERTS. */
export function addAlert(alerts: TransferAlert[], alert: TransferAlert): TransferAlert[] {
  return [alert, ...alerts].slice(0, MAX_ALERTS)
}
