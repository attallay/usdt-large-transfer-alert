import {
  LARGE_TRANSFER_THRESHOLD,
  isLargeTransfer,
  toLargeTransfer,
  type TransferLog,
} from './usdt-transfer.js';

const FROM = '0x1111111111111111111111111111111111111111';
const TO = '0x2222222222222222222222222222222222222222';
const TX_HASH = `0x${'ab'.repeat(32)}` as const;

function transferLog(
  value: bigint,
  overrides: Partial<TransferLog> = {},
): TransferLog {
  return {
    args: { from: FROM, to: TO, value },
    transactionHash: TX_HASH,
    blockNumber: 26_242_744n,
    removed: false,
    ...overrides,
  };
}

describe('LARGE_TRANSFER_THRESHOLD', () => {
  it('is 100,000 USDT written with 6 decimal places', () => {
    expect(LARGE_TRANSFER_THRESHOLD).toBe(100_000_000_000n);
  });
});

describe('isLargeTransfer', () => {
  it('is false just below 100,000 USDT (99,999.999999)', () => {
    expect(isLargeTransfer(99_999_999_999n)).toBe(false);
  });

  it('is true at exactly 100,000 USDT', () => {
    expect(isLargeTransfer(100_000_000_000n)).toBe(true);
  });

  it('is false for a raw value of 100,000, which is only 0.1 USDT', () => {
    expect(isLargeTransfer(100_000n)).toBe(false);
  });
});

describe('toLargeTransfer', () => {
  it('converts a large transfer and keeps the exact amount', () => {
    expect(toLargeTransfer(transferLog(250_000_500_000n))).toEqual({
      from: FROM,
      to: TO,
      amount: '250000.5',
      txHash: TX_HASH,
      blockNumber: 26_242_744n,
    });
  });

  it('ignores transfers below the threshold', () => {
    expect(toLargeTransfer(transferLog(5_000_000n))).toBeNull();
  });

  it('ignores logs removed by a chain reorganization', () => {
    expect(
      toLargeTransfer(transferLog(500_000_000_000n, { removed: true })),
    ).toBeNull();
  });

  it('keeps every digit of amounts too large for a normal JavaScript number', () => {
    // 10 billion USDT + 1 raw unit. As a normal number, the last digit would be rounded away.
    expect(toLargeTransfer(transferLog(10_000_000_000_000_001n))?.amount).toBe(
      '10000000000.000001',
    );
  });
});
