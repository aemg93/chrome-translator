export type DetectedLanguage = {
  language: string
  confidence: number
}

export interface TranslationEngine {
  detect(text: string): Promise<DetectedLanguage>
  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string>
}
