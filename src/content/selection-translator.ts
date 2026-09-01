import {
  ChromeBuiltInTranslationProvider,
} from '../services/translation/ChromeBuiltInTranslationProvider'

import {
  getLanguagePair,
} from './language-settings'

import type { SelectionSnapshot } from './selection-types'
import { captureSelection, getSelectionSignature } from './selection-capture'
import { replaceInputSelection } from './input-replacement'
import { replaceContentEditableSelection } from './contenteditable-replacement'
import { getTranslationDirection } from './translation-direction'
import { removeTranslation, showTranslation } from './translation-popup'
import { installHistoryHooks } from './navigation-hooks'

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

async function translateSnapshot(selection: SelectionSnapshot): Promise<void> {
  const currentRequest = ++requestId

  const pair = await getLanguagePair()

  if (currentRequest !== requestId) {
    return
  }

  const detectionText = selection.text.slice(0, LANGUAGE_DETECTION_SAMPLE_SIZE)

  const detected = await provider.detect(detectionText)

  if (currentRequest !== requestId) {
    return
  }

  const direction = getTranslationDirection(
    detected.language,
    pair.source,
    pair.target,
  )

  if (!direction) {
    console.log(
      '[Chrome Translator] Idioma no pertenece al par configurado; selección ignorada:',
      {
        detected: detected.language,
        source: pair.source,
        target: pair.target,
      },
    )

    return
  }

  console.log(
    '[Chrome Translator] Traducción:',
    {
      text: selection.text,
      detected: detected.language,
      source: direction.source,
      target: direction.target,
      editable: selection.editable,
      requestId: currentRequest,
    },
  )

  if (direction.source === direction.target) {
    return
  }

  const translated = await provider.translate(
    selection.text,
    direction.source,
    direction.target,
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
        language: direction.source,
        confidence: detected.confidence,
      },
      direction.target,
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