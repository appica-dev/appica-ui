import { getContext, setContext } from 'svelte'

export type FormErrors = Record<string, string | string[] | null | undefined>

export interface FormContextValue {
  errors: () => FormErrors
  onClearErrors: () => ((errors: FormErrors) => void) | undefined
}

const KEY = Symbol('appica-form')

export function setFormContext(value: FormContextValue) {
  setContext(KEY, value)
}

export function getFormContext(): FormContextValue | undefined {
  return getContext<FormContextValue>(KEY)
}
