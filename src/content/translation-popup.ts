import type { DetectedLanguage } from './selection-types'
import { getLanguageFlag } from './translation-direction'

let translationHost: HTMLDivElement | null = null

function removeTranslation(): void {
  translationHost?.remove()
  translationHost = null
}

function showTranslation(
  range: Range,
  translatedText: string,
  detected: DetectedLanguage,
  targetLanguage: string,
): void {
  removeTranslation()

  const host =
    document.createElement('div')

  host.dataset.chromeTranslator =
    'true'

  Object.assign(host.style, {
    position: 'fixed',
    zIndex: '2147483647',
    width: '300px',
    pointerEvents: 'none',
  })

  const shadow =
    host.attachShadow({
      mode: 'open',
    })

  const box =
    document.createElement('div')

  const position =
    getPosition(range)

  Object.assign(box.style, {
    position: 'fixed',
    left: `${position.left}px`,
    top: `${position.top}px`,
    maxWidth: '300px',
    padding: '8px 10px',
    border:
      '1px solid rgba(0,0,0,.12)',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#222222',
    boxShadow:
      '0 4px 16px rgba(0,0,0,.18)',
    fontFamily:
      'Arial, sans-serif',
    fontSize: '14px',
    lineHeight: '1.4',
  })

  box.textContent =
    `${getLanguageFlag(targetLanguage)} ${translatedText}`

  box.title =
    `Idioma detectado: ${detected.language} (${Math.round(
      detected.confidence * 100,
    )}%). Traducción: ${targetLanguage}`

  shadow.appendChild(box)

  document.documentElement.appendChild(
    host,
  )

  translationHost = host
}

function getPosition(
  range: Range,
): {
  left: number
  top: number
} {
  const rect =
    range.getBoundingClientRect()

  const width = 300

  return {
    left: Math.min(
      Math.max(
        8,
        rect.left,
      ),
      Math.max(
        8,
        window.innerWidth -
          width -
          8,
      ),
    ),
    top: Math.min(
      Math.max(
        8,
        rect.bottom + 8,
      ),
      Math.max(
        8,
        window.innerHeight -
          90,
      ),
    ),
  }
}

export { removeTranslation, showTranslation }