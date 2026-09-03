import { getContext, setContext } from 'svelte'

export type SelectSize = 'sm' | 'md' | 'lg'
export type SelectVariant = 'outline' | 'soft'

export interface SelectContextValue {
  size: SelectSize
  variant: SelectVariant
  alignItemWithTrigger: boolean
  hasValue: () => boolean
  clear: () => void
  multiple: boolean
}

const KEY = Symbol('appica-select')

export function setSelectContext(value: SelectContextValue) {
  setContext(KEY, value)
}

export function getSelectContext(): SelectContextValue {
  const ctx = getContext<SelectContextValue>(KEY)
  if (!ctx) {
    throw new Error('Select sub-components must be rendered inside <Select>')
  }
  return ctx
}
