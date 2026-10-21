import { formatUnits, parseUnits, type Address, type Hash } from 'viem';

/** Tether USD (USDT) token contract on Ethereum Mainnet. */
export const USDT_ADDRESS: Address =
  '0xdAC17F958D2ee523a2206206994597C13D831ec7';

/** USDT stores amounts as whole numbers with 6 decimal places: 1 USDT is stored as 1_000_000. */
export const USDT_DECIMALS = 6;

/** 100,000 USDT in raw units: 100_000 × 10^6 = 100_000_000_000n. */
export const LARGE_TRANSFER_THRESHOLD = parseUnits('100000', USDT_DECIMALS);

/** The parts of a decoded Transfer event log that we use. */
export interface TransferLog {
  args: { from: Address; to: Address; value: bigint };
  transactionHash: Hash;
  blockNumber: bigint;
  /** True when the block containing this log was replaced by another one (a chain "reorg"). */
  removed: boolean;
}

/** A transfer of at least 100,000 USDT, ready to be logged or sent as a notification. */
export interface LargeTransfer {
  from: Address;
  to: Address;
  /** Exact amount in USDT as a decimal string, e.g. "250000.5". */
  amount: string;
  txHash: Hash;
  blockNumber: bigint;
}

export function isLargeTransfer(rawValue: bigint): boolean {
  return rawValue >= LARGE_TRANSFER_THRESHOLD;
}

/** Returns the large transfer described by a log, or null if it is too small or was removed. */
export function toLargeTransfer(log: TransferLog): LargeTransfer | null {
  if (log.removed || !isLargeTransfer(log.args.value)) {
    return null;
  }
  return {
    from: log.args.from,
    to: log.args.to,
    amount: formatUnits(log.args.value, USDT_DECIMALS),
    txHash: log.transactionHash,
    blockNumber: log.blockNumber,
  };
}
