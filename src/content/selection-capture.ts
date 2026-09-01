import type { SelectionSnapshot } from './selection-types'
import { isEditableElement, findEditableElement } from './editable-element'

function captureSelection():
  | SelectionSnapshot
  | null {
  const active =
    document.activeElement

  /*
   * INPUT / TEXTAREA
   */
  if (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement
  ) {
    if (
      !isEditableElement(active)
    ) {
      return null
    }

    const start =
      active.selectionStart ?? 0

    const end =
      active.selectionEnd ?? 0

    if (
      start === end
    ) {
      return null
    }

    const text =
      active.value.slice(
        start,
        end,
      )

    if (!text.trim()) {
      return null
    }

    return {
      text,
      element: active,
      start,
      end,
      range: null,
      editable: true,
      url: location.href,
    }
  }

  /*
   * CONTENTEDITABLE / ROLE=TEXTBOX
   */
  const nativeSelection =
    window.getSelection()

  if (
    active instanceof HTMLElement &&
    isEditableElement(active) &&
    nativeSelection &&
    nativeSelection.rangeCount > 0 &&
    !nativeSelection.isCollapsed
  ) {
    const text =
      nativeSelection.toString()

    if (!text.trim()) {
      return null
    }

    const range =
      nativeSelection
        .getRangeAt(0)
        .cloneRange()

    const element =
      findEditableElement(active)

    if (!element) {
      return null
    }

    return {
      text,
      element,
      start: 0,
      end: 0,
      range,
      editable: true,
      url: location.href,
    }
  }

  /*
   * TEXTO NORMAL DE LA PÁGINA
   */
  if (
    nativeSelection &&
    nativeSelection.rangeCount > 0 &&
    !nativeSelection.isCollapsed
  ) {
    const text =
      nativeSelection.toString()

    if (!text.trim()) {
      return null
    }

    const range =
      nativeSelection
        .getRangeAt(0)
        .cloneRange()

    const container =
      range.commonAncestorContainer

    const element =
      container.nodeType === Node.ELEMENT_NODE
        ? container as HTMLElement
        : container.parentElement

    /*
     * Si la selección pertenece a un editable,
     * siempre la procesa el flujo editable.
     */
    if (
      isEditableElement(element)
    ) {
      return null
    }

    return {
      text,
      element: null,
      start: 0,
      end: 0,
      range,
      editable: false,
      url: location.href,
    }
  }

  return null
}

function getSelectionSignature(
  selection: SelectionSnapshot,
): string {
  return [
    selection.editable
      ? 'editable'
      : 'page',
    selection.text,
    selection.start,
    selection.end,
    selection.url,
  ].join('|')
}

export { captureSelection, getSelectionSignature }