import { describe, expect, it } from 'vitest'
import { MAX_ALERTS, addAlert, toTransferAlert, type TransferAlert } from './transfer-alert'

const DATA = {
  fromAddress: '0x7F0F90a1F8529cC0b2Dee43A51F69203Bdf9632F',
  toAddress: '0xfB19085AC3951cB0AF7B5A6126F4bfF8E2D1F8eE',
  amount: '107689.108135',
  txHash: `0x${'ab'.repeat(32)}`,
  blockNumber: '26243247',
}

describe('toTransferAlert', () => {
  it('turns valid message data into an alert', () => {
    const receivedAt = new Date('2026-10-21T12:00:00Z')
    expect(toTransferAlert(DATA, receivedAt)).toEqual({ ...DATA, id: expect.any(String), receivedAt })
  })

  it('gives every alert its own id', () => {
    expect(toTransferAlert(DATA)?.id).not.toBe(toTransferAlert(DATA)?.id)
  })

  it('ignores messages without data', () => {
    expect(toTransferAlert(undefined)).toBeNull()
  })

  it.each([
    ['a missing field', { ...DATA, txHash: undefined }],
    ['a malformed address', { ...DATA, toAddress: '0x123' }],
    ['a non-numeric amount', { ...DATA, amount: 'lots' }],
  ])('ignores data with %s', (_case, data) => {
    expect(toTransferAlert(data as Record<string, string>)).toBeNull()
  })
})

describe('addAlert', () => {
  const alert = (n: number) => ({ ...toTransferAlert(DATA), id: `alert-${n}` }) as TransferAlert

  it('puts the newest alert first', () => {
    expect(addAlert([alert(1)], alert(2)).map((a) => a.id)).toEqual(['alert-2', 'alert-1'])
  })

  it(`keeps at most ${MAX_ALERTS} alerts, dropping the oldest`, () => {
    let alerts: TransferAlert[] = []
    for (let n = 1; n <= MAX_ALERTS + 5; n++) {
      alerts = addAlert(alerts, alert(n))
    }
    expect(alerts).toHaveLength(MAX_ALERTS)
    expect(alerts[0].id).toBe(`alert-${MAX_ALERTS + 5}`)
    expect(alerts.at(-1)?.id).toBe('alert-6')
  })
})
