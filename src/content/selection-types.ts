export type DetectedLanguage = {
  language: string
  confidence: number
}

export type SelectionSnapshot = {
  text: string
  element:
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLElement
    | null
  start: number
  end: number
  range: Range | null
  editable: boolean
  url: string
}