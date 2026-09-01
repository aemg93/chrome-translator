import type {
  DetectedLanguage,
} from './TranslationEngine'

import type {
  TranslationEngine,
} from './TranslationEngine'

export class ChromeBuiltInTranslationProvider
  implements TranslationEngine
{
  private detector:
    LanguageDetector | null = null

  private readonly translators =
    new Map<string, Translator>()

  async detect(
    text: string,
  ): Promise<DetectedLanguage> {
    if (!text.trim()) {
      throw new Error(
        'No se puede detectar un texto vacío.',
      )
    }

    if (
      !('LanguageDetector' in window)
    ) {
      throw new Error(
        'Language Detector API no está disponible en este Chrome.',
      )
    }

    if (!this.detector) {
      this.detector =
        await LanguageDetector.create({
          monitor: (monitor) => {
            monitor.addEventListener(
              'downloadprogress',
              (event) => {
                console.log(
                  '[Chrome Translator] Descarga Language Detector:',
                  Math.round(
                    event.loaded * 100,
                  ) + '%',
                )
              },
            )
          },
        })
    }

    const results =
      await this.detector.detect(
        text,
      )

    const detected = results.find(
      (result) =>
        typeof result.detectedLanguage === 'string' &&
        result.detectedLanguage !== 'und' &&
        typeof result.confidence === 'number',
    )

    if (
      !detected ||
      typeof detected.detectedLanguage !== 'string' ||
      typeof detected.confidence !== 'number'
    ) {
      throw new Error(
        'No se pudo detectar el idioma.',
      )
    }

    return {
      language: detected.detectedLanguage,
      confidence: detected.confidence,
    }
  }

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    if (!text.trim()) {
      throw new Error(
        'No se puede traducir un texto vacío.',
      )
    }

    if (
      sourceLanguage ===
      targetLanguage
    ) {
      return text
    }

    if (!('Translator' in window)) {
      throw new Error(
        'Translator API no está disponible en este Chrome.',
      )
    }

    const key =
      `${sourceLanguage}:${targetLanguage}`

    let translator =
      this.translators.get(key)

    if (!translator) {
      const availability =
        await Translator.availability({
          sourceLanguage,
          targetLanguage,
        })

      console.log(
        '[Chrome Translator] Disponibilidad:',
        {
          sourceLanguage,
          targetLanguage,
          availability,
        },
      )

      if (
        availability ===
        'unavailable'
      ) {
        throw new Error(
          `Chrome no admite ${sourceLanguage} → ${targetLanguage}.`,
        )
      }

      translator =
        await Translator.create({
          sourceLanguage,
          targetLanguage,
          monitor: (monitor) => {
            monitor.addEventListener(
              'downloadprogress',
              (event) => {
                console.log(
                  '[Chrome Translator] Descarga modelo:',
                  Math.round(
                    event.loaded * 100,
                  ) + '%',
                )
              },
            )
          },
        })

      this.translators.set(
        key,
        translator,
      )
    }

    return translator.translate(
      text,
    )
  }
}
