import type { SelectionSnapshot } from './selection-types'

function replaceInputSelection(
  selection: SelectionSnapshot,
  translated: string,
): boolean {
  const element =
    selection.element

  if (
    !(
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    )
  ) {
    return false
  }

  if (
    !element.isConnected ||
    location.href !== selection.url
  ) {
    return false
  }

  const value =
    element.value

  /*
   * Verificación de concurrencia:
   * no reemplazar si el usuario cambió el valor
   * después de capturar la selección.
   */
  const selectedCurrent =
    value.slice(
      selection.start,
      selection.end,
    )

  if (
    selectedCurrent !== selection.text
  ) {
    console.log(
      '[Chrome Translator] Selección editable cambió; se descarta la respuesta antigua.',
    )

    return false
  }

  const nextValue =
    value.slice(
      0,
      selection.start,
    ) +
    translated +
    value.slice(
      selection.end,
    )

  const prototype =
    Object.getPrototypeOf(element)

  const descriptor =
    Object.getOwnPropertyDescriptor(
      prototype,
      'value',
    )

  descriptor?.set?.call(
    element,
    nextValue,
  )

  const cursor =
    selection.start +
    translated.length

  element.focus()

  element.setSelectionRange(
    cursor,
    cursor,
  )

  element.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
      data: translated,
    }),
  )

  element.dispatchEvent(
    new Event('change', {
      bubbles: true,
    }),
  )

  return true
}

export { replaceInputSelection }