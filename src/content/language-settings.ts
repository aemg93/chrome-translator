export type LanguagePair = {
  source: string
  target: string
}

const LANGUAGE_PAIR_KEY = 'translationLanguagePair'

const DEFAULT_LANGUAGE_PAIR: LanguagePair = {
  source: 'es',
  target: 'en',
}

export async function getLanguagePair(): Promise<LanguagePair> {
  const result =
    await chrome.storage.local.get(
      LANGUAGE_PAIR_KEY,
    )

  const raw =
    result[LANGUAGE_PAIR_KEY]

  if (
    typeof raw === 'object' &&
    raw !== null &&
    'source' in raw &&
    'target' in raw &&
    typeof raw.source === 'string' &&
    typeof raw.target === 'string'
  ) {
    return {
      source: raw.source,
      target: raw.target,
    }
  }

  return DEFAULT_LANGUAGE_PAIR
}
