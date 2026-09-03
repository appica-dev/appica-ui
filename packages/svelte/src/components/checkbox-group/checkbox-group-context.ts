import { getContext, setContext } from 'svelte'

export interface CheckboxGroupContextValue {
  getValue: () => string[]
  setValue: (value: string[]) => void
  allValues: () => string[] | undefined
}

const KEY = Symbol('appica-checkbox-group')

export function setCheckboxGroupContext(value: CheckboxGroupContextValue) {
  setContext(KEY, value)
}

export function getCheckboxGroupContext(): CheckboxGroupContextValue | undefined {
  return getContext<CheckboxGroupContextValue>(KEY)
}
