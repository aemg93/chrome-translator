import type { SelectionSnapshot } from './selection-types'

function replaceContentEditableSelection(
  selection: SelectionSnapshot,
  translated: string,
): boolean {
  console.log(
    '[Chrome Translator][DEBUG] replaceContentEditableSelection',
    {
      element: selection.element,
      tagName: selection.element?.tagName,
      contentEditable:
        selection.element?.contentEditable,
      isContentEditable:
        selection.element?.isContentEditable,
      role:
        selection.element?.getAttribute('role'),
      className:
        selection.element?.className,
      rangeConnected:
        Boolean(
          selection.range?.startContainer.isConnected &&
          selection.range?.endContainer.isConnected,
        ),
      currentText:
        selection.range?.toString(),
      originalText:
        selection.text,
    },
  )

  if (
    !selection.range ||
    !selection.element ||
    !selection.element.isConnected ||
    location.href !== selection.url
  ) {
    return false
  }

  const range =
    selection.range.cloneRange()

  const currentText =
    range.toString()

  if (
    currentText !== selection.text
  ) {
    console.log(
      '[Chrome Translator] Selección contenteditable cambió; se descarta la respuesta antigua.',
    )

    return false
  }

  const nativeSelection =
    window.getSelection()

  if (!nativeSelection) {
    return false
  }

  nativeSelection.removeAllRanges()
  nativeSelection.addRange(range)

  const replaced =
    document.execCommand(
      'insertText',
      false,
      translated,
    )

  if (!replaced) {
    console.log(
      '[Chrome Translator] execCommand insertText no pudo reemplazar la selección.',
    )

    return false
  }

  selection.element.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
      data: translated,
    }),
  )

  return true
}

export { replaceContentEditableSelection }