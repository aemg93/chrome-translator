import {
  ChromeBuiltInTranslationProvider,
} from '../services/translation/ChromeBuiltInTranslationProvider'

import type { SelectionSnapshot } from './selection-types'
import { captureSelection, getSelectionSignature } from './selection-capture'
import { replaceInputSelection } from './input-replacement'
import { replaceContentEditableSelection } from './contenteditable-replacement'
import { removeTranslation, showTranslation } from './translation-popup'
import { installHistoryHooks } from './navigation-hooks'
import { getTranslationConfig } from './language-settings'

let debounceTimer: number | null = null
let requestId = 0
let lastProcessedSignature = ''
let currentSelection: SelectionSnapshot | null = null

const provider = new ChromeBuiltInTranslationProvider()
const LANGUAGE_DETECTION_SAMPLE_SIZE = 500
const STARTED_FLAG = '__chromeTranslatorSelectionTranslatorStarted'

function clearSelectionState(): void {
  requestId += 1
  lastProcessedSignature = ''
  currentSelection = null
  removeTranslation()

  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

async function getConfig(): Promise<{ enabled: boolean; writingLanguage: string; incomingTarget: string; outgoingTarget: string }> {
  const config = await getTranslationConfig()
  const enabledRaw = await chrome.storage.local.get('extensionEnabled')
  const enabled = typeof enabledRaw.extensionEnabled === 'boolean' ? enabledRaw.extensionEnabled : true
  return { enabled, ...config }
}

async function translateSnapshot(selection: SelectionSnapshot): Promise<void> {
  const currentRequest = ++requestId

  const config = await getConfig()
  if (!config.enabled) {
    // extension is disabled
    return
  }
  if (currentRequest !== requestId) {
    return
  }

  // If the selection is empty, nothing to do
  if (!selection.text || !selection.text.trim()) {
    return
  }

  let sourceLang: string
  let targetLang: string
  let detectedLanguage: string | undefined
  let detectedConfidence: number | undefined

  if (selection.editable) {
    // For user‑typed text, trust the configured writing language
    sourceLang = config.writingLanguage
    targetLang = config.outgoingTarget
    // Log the attempt (editable)
    console.log(
      '[Chrome Translator] Traducción (editable):',
      {
        text: selection.text,
        source: sourceLang,
        target: targetLang,
        editable: true,
        requestId: currentRequest,
      },
    )
    // If source and target are the same, no translation needed
    if (sourceLang === targetLang) {
      return
    }
  } else {
    // For page/received text, detect language
    const detectionText = selection.text.slice(0, LANGUAGE_DETECTION_SAMPLE_SIZE)
    try {
      const detected = await provider.detect(detectionText)
      detectedLanguage = detected.language
      detectedConfidence = detected.confidence
    } catch (e) {
      // If detection fails (should not happen for non‑empty text), fallback
      detectedLanguage = ''
      detectedConfidence = 0
    }
    sourceLang = detectedLanguage ?? ''
    targetLang = config.incomingTarget
    // If detected language equals target, skip unnecessary translation
    if (sourceLang === targetLang) {
      console.log(
        '[Chrome Translator] Idioma ya es el destino; selección ignorada:',
        { detected: sourceLang, target: targetLang },
      )
      return
    }
    console.log(
      '[Chrome Translator] Traducción:',
      {
        text: selection.text,
        detected: sourceLang,
        source: sourceLang,
        target: targetLang,
        editable: false,
        requestId: currentRequest,
      },
    )
  }

  // Perform translation
  const translated = await provider.translate(
    selection.text,
    sourceLang,
    targetLang,
  )

  if (currentRequest !== requestId) {
    console.log('[Chrome Translator] Respuesta antigua ignorada.')
    return
  }

  if (selection.editable) {
    let replaced = false
    if (
      selection.element instanceof HTMLInputElement ||
      selection.element instanceof HTMLTextAreaElement
    ) {
      replaced = replaceInputSelection(selection, translated)
    } else {
      replaced = replaceContentEditableSelection(selection, translated)
    }

    if (replaced) {
      console.log(
        '[Chrome Translator] Selección editable reemplazada:',
        translated,
      )
    }

    return
  }

  if (selection.range) {
    showTranslation(
      selection.range,
      translated,
      {
        language: detectedLanguage ?? sourceLang,
        confidence: detectedConfidence ?? 0,
      },
      targetLang,
    )
  }
}

function scheduleSelectionProcessing(): void {
  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer)
  }

  const selection = captureSelection()

  if (!selection) {
    return
  }

  currentSelection = selection

  const signature = getSelectionSignature(selection)

  if (signature === lastProcessedSignature) {
    return
  }

  debounceTimer = window.setTimeout(
    () => {
      debounceTimer = null

      const snapshot = currentSelection

      if (!snapshot) {
        return
      }

      const currentSignature = getSelectionSignature(snapshot)

      lastProcessedSignature = currentSignature

      void translateSnapshot(snapshot)
    },
    180,
  )
}

function handleSelectionChange(): void {
  const selection = captureSelection()
  if (!selection) {
    return
  }
  currentSelection = selection
  scheduleSelectionProcessing()
}

function handlePointerDown(): void {
  requestId += 1
  removeTranslation()
  lastProcessedSignature = ''
}

function handleNavigation(): void {
  console.log(
    '[Chrome Translator] Cambio de navegación detectado; reiniciando estado.',
  )
  clearSelectionState()
}

export function startSelectionTranslator(): void {
  const windowState = window as Window & {
    [STARTED_FLAG]?: boolean
  }

  if (windowState[STARTED_FLAG]) {
    console.log(
      '[Chrome Translator] Content script ya estaba activo en este documento.',
    )
    return
  }

  windowState[STARTED_FLAG] = true

  document.addEventListener('selectionchange', handleSelectionChange, true)
  document.addEventListener('pointerup', handleSelectionChange, true)
  document.addEventListener('keyup', handleSelectionChange, true)
  document.addEventListener('pointerdown', handlePointerDown, true)
  window.addEventListener('popstate', handleNavigation)
  window.addEventListener('hashchange', handleNavigation)
  window.addEventListener('pageshow', handleNavigation)
  window.addEventListener('chrome-translator:navigation', handleNavigation)
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'visible') {
        lastProcessedSignature = ''
      }
    },
  )

  installHistoryHooks(handleNavigation)

  console.log('[Chrome Translator] Traductor universal por selección activo')
}
