// Number and time formatting in the page's language, and Etherscan links, for the alert cards.

const amountFormats = new Map<string, Intl.NumberFormat>()
const timeFormats = new Map<string, Intl.DateTimeFormat>()

/** Creating a formatter is relatively slow, so each one is made once per locale and reused. */
function cached<T>(cache: Map<string, T>, locale: string, create: (locale: string) => T): T {
  let value = cache.get(locale)
  if (value === undefined) {
    value = create(locale)
    cache.set(locale, value)
  }
  return value
}

/**
 * "4000000" -> "4.000.000,00" (tr-TR) or "4,000,000.00" (en-US).
 * The exact decimal text is rounded to 2 digits, not converted to a float first.
 */
export function formatUsdtAmount(amount: string, locale: string): string {
  const format = cached(amountFormats, locale, (l) =>
    new Intl.NumberFormat(l, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  )
  return format.format(amount as Intl.StringNumericLiteral)
}

/** The time of day, e.g. "14:03:21" (tr-TR) or "02:03:21 PM" (en-US). */
export function formatTime(date: Date, locale: string): string {
  const format = cached(timeFormats, locale, (l) =>
    new Intl.DateTimeFormat(l, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  )
  return format.format(date)
}

export function etherscanTxUrl(txHash: string): string {
  return `https://etherscan.io/tx/${txHash}`
}

export function etherscanAddressUrl(address: string): string {
  return `https://etherscan.io/address/${address}`
}
