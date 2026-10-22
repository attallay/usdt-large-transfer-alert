import { TEXTS, type Language, type Texts } from './texts'

/**
 * Turkish if the browser's preferred languages list Turkish before English, otherwise English.
 * Language tags look like "tr-TR" or "en-US"; only the part before "-" matters here.
 */
export function detectLanguage(preferred: readonly string[]): Language {
  for (const tag of preferred) {
    const base = tag.toLowerCase().split('-')[0]
    if (base === 'tr' || base === 'en') {
      return base
    }
  }
  return 'en'
}

function browserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return []
  return navigator.languages.length > 0 ? navigator.languages : [navigator.language]
}

/** The page's language, chosen once from the browser's language settings. */
export const language: Language = detectLanguage(browserLanguages())

/** All texts of the page, in that language. */
export const t: Texts = TEXTS[language]
