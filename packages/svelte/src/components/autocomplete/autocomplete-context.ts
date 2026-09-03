import { getContext, setContext } from 'svelte'

export type AutocompleteSize = 'sm' | 'md' | 'lg'
export type AutocompleteVariant = 'outline' | 'soft'

export interface AutocompleteContextValue {
  size: AutocompleteSize
  variant: AutocompleteVariant
  clearable: boolean
  icon: boolean
  grid: boolean
  hasItems: () => boolean
  filteredItems: () => readonly unknown[]
  isEmpty: () => boolean
  stringify: (item: unknown) => string
  inputValue: () => string
  setInputValue: (next: string) => void
  hasValue: () => boolean
  clear: () => void
  disabled: () => boolean
}

export interface AutocompleteGroupContextValue {
  items: () => readonly unknown[]
}

const KEY = Symbol('appica-autocomplete')
const GROUP_KEY = Symbol('appica-autocomplete-group')

export function setAutocompleteContext(value: AutocompleteContextValue) {
  setContext(KEY, value)
}

export function getAutocompleteContext(): AutocompleteContextValue {
  const ctx = getContext<AutocompleteContextValue>(KEY)
  if (!ctx) {
    throw new Error('Autocomplete sub-components must be rendered inside <Autocomplete>')
  }
  return ctx
}

export function setAutocompleteGroupContext(value: AutocompleteGroupContextValue) {
  setContext(GROUP_KEY, value)
}

export function getAutocompleteGroupContext(): AutocompleteGroupContextValue {
  const ctx = getContext<AutocompleteGroupContextValue>(GROUP_KEY)
  if (!ctx) {
    throw new Error('AutocompleteCollection must be rendered inside <AutocompleteGroup>')
  }
  return ctx
}
