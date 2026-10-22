import { describe, expect, it } from 'vitest'
import { etherscanAddressUrl, etherscanTxUrl, formatTime, formatUsdtAmount } from './format'

describe('formatUsdtAmount', () => {
  it('uses Turkish separators in Turkish: dots for thousands, a comma for decimals', () => {
    expect(formatUsdtAmount('4000000', 'tr-TR')).toBe('4.000.000,00')
    expect(formatUsdtAmount('107689.108135', 'tr-TR')).toBe('107.689,11')
  })

  it('uses English separators in English: commas for thousands, a dot for decimals', () => {
    expect(formatUsdtAmount('4000000', 'en-US')).toBe('4,000,000.00')
    expect(formatUsdtAmount('107689.108135', 'en-US')).toBe('107,689.11')
  })

  it('rounds the exact decimal text, even beyond normal number precision', () => {
    expect(formatUsdtAmount('10000000000.005', 'tr-TR')).toBe('10.000.000.000,01')
  })
})

describe('formatTime', () => {
  const time = new Date(2026, 9, 21, 14, 3, 21)

  it('uses the 24-hour clock in Turkish', () => {
    expect(formatTime(time, 'tr-TR')).toBe('14:03:21')
  })

  it('uses the 12-hour clock in US English', () => {
    // The space before "PM" may be a special narrow space, which \s also matches.
    expect(formatTime(time, 'en-US')).toMatch(/^02:03:21\sPM$/)
  })
})

describe('Etherscan links', () => {
  it('points to the transaction and address pages', () => {
    expect(etherscanTxUrl('0xabc')).toBe('https://etherscan.io/tx/0xabc')
    expect(etherscanAddressUrl('0xdef')).toBe('https://etherscan.io/address/0xdef')
  })
})
