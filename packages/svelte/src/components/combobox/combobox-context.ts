import { getContext, setContext } from 'svelte'

export type ComboboxSize = 'sm' | 'md' | 'lg'
export type ComboboxVariant = 'outline' | 'soft'

export interface ComboboxContextValue {
  size: ComboboxSize
  variant: ComboboxVariant
  clearable: boolean
  icon: boolean
  grid: boolean
  multiple: boolean
  hasValue: () => boolean
  clear: () => void
  remove: (item: string) => void
  selected: () => string | string[]
  toggle: () => void
}

const KEY = Symbol('appica-combobox')

export function setComboboxContext(value: ComboboxContextValue) {
  setContext(KEY, value)
}

export function getComboboxContext(): ComboboxContextValue {
  const ctx = getContext<ComboboxContextValue>(KEY)
  if (!ctx) {
    throw new Error('Combobox sub-components must be rendered inside <Combobox>')
  }
  return ctx
}
