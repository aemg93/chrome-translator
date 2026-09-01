function normalizeLanguage(
  language: string,
): string {
  return language
    .toLowerCase()
    .split('-')[0]
}

function getLanguageFlag(
  language: string,
): string {
  const flags: Record<string, string> = {
    es: '🇪🇸',
    en: '🇺🇸',
    pt: '🇧🇷',
    fr: '🇫🇷',
    it: '🇮🇹',
    de: '🇩🇪',
  }

  return flags[
    normalizeLanguage(language)
  ] ?? '🌐'
}

function getTranslationDirection(
  detectedLanguage: string,
  sourceLanguage: string,
  targetLanguage: string,
): {
  source: string
  target: string
} | null {
  const detected =
    normalizeLanguage(
      detectedLanguage,
    )

  const source =
    normalizeLanguage(
      sourceLanguage,
    )

  const target =
    normalizeLanguage(
      targetLanguage,
    )

  /*
   * DIRECCIÓN ESTRICTA:
   *
   * Idioma configurado como origen -> destino.
   * Idioma configurado como destino -> origen.
   *
   * No existe un fallback silencioso.
   */
  if (
    detected === source
  ) {
    return {
      source,
      target,
    }
  }

  if (
    detected === target
  ) {
    return {
      source: target,
      target: source,
    }
  }

  return null
}

export { normalizeLanguage, getLanguageFlag, getTranslationDirection }