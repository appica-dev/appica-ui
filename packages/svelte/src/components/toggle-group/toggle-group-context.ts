import { getContext, setContext } from 'svelte'

const KEY = Symbol('appica-toggle-group')

export function setToggleGroupContext() {
  setContext(KEY, true)
}

export function getToggleGroupContext(): boolean {
  return getContext<boolean | undefined>(KEY) === true
}
