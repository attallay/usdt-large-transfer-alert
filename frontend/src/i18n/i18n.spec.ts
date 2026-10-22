import { describe, expect, it } from 'vitest'
import { detectLanguage } from './i18n'

describe('detectLanguage', () => {
  it('uses Turkish when the browser prefers Turkish', () => {
    expect(detectLanguage(['tr-TR', 'en-US'])).toBe('tr')
  })

  it('uses English when the browser prefers English', () => {
    expect(detectLanguage(['en-US', 'tr'])).toBe('en')
  })

  it('skips unsupported languages and takes the first supported one', () => {
    expect(detectLanguage(['de-DE', 'TR'])).toBe('tr')
  })

  it('falls back to English when no supported language is listed', () => {
    expect(detectLanguage(['de-DE', 'fr'])).toBe('en')
    expect(detectLanguage([])).toBe('en')
  })
})
