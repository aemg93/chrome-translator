function isEditableElement(
  element: HTMLElement | null,
): boolean {
  if (!element) {
    return false
  }

  if (
    element instanceof HTMLInputElement
  ) {
    return [
      'text',
      'search',
      'email',
      'url',
      'tel',
    ].includes(element.type)
  }

  if (
    element instanceof HTMLTextAreaElement
  ) {
    return true
  }

  if (
    element.isContentEditable
  ) {
    return true
  }

  if (
    element.getAttribute('role') ===
    'textbox'
  ) {
    return (
      element.getAttribute(
        'aria-readonly',
      ) !== 'true'
    )
  }

  return Boolean(
    element.closest(
      'textarea,' +
      'input[type="text"],' +
      'input[type="search"],' +
      'input[type="email"],' +
      'input[type="url"],' +
      'input[type="tel"],' +
      '[contenteditable="true"],' +
      '[contenteditable=""],' +
      '[role="textbox"]',
    ),
  )
}

function findEditableElement(
  element: HTMLElement | null,
): HTMLElement | null {
  if (!element) {
    return null
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element.isContentEditable ||
    element.getAttribute('role') ===
      'textbox'
  ) {
    return element
  }

  return element.closest(
    'textarea,' +
    'input[type="text"],' +
    'input[type="search"],' +
    'input[type="email"],' +
    'input[type="url"],' +
    'input[type="tel"],' +
    '[contenteditable="true"],' +
    '[contenteditable=""],' +
    '[role="textbox"]',
  )
}

export { isEditableElement, findEditableElement }