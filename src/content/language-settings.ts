export type TranslationSettings = {
  incomingTarget: string
  outgoingTarget: string
  writingLanguage: string
}

const TRANSLATION_SETTINGS_KEY = 'translationSettings'

const DEFAULT_SETTINGS: TranslationSettings = {
  incomingTarget: 'en',
  outgoingTarget: 'es',
  writingLanguage: 'en',
}

export async function getTranslationConfig(): Promise<TranslationSettings> {
  const result =
    await chrome.storage.local.get(
      TRANSLATION_SETTINGS_KEY,
    )

  const raw =
    result[TRANSLATION_SETTINGS_KEY]

  if (
    typeof raw === 'object' &&
    raw !== null &&
    'incomingTarget' in raw &&
    'outgoingTarget' in raw &&
    'writingLanguage' in raw &&
    typeof raw.incomingTarget === 'string' &&
    typeof raw.outgoingTarget === 'string' &&
    typeof raw.writingLanguage === 'string'
  ) {
    return {
      incomingTarget: raw.incomingTarget,
      outgoingTarget: raw.outgoingTarget,
      writingLanguage: raw.writingLanguage,
    }
  }

  return DEFAULT_SETTINGS
}
