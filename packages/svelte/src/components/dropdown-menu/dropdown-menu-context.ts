import { getContext, setContext } from 'svelte'

export type DropdownMenuSize = 'sm' | 'md' | 'lg'

export interface DropdownMenuContextValue {
  size: DropdownMenuSize
}

const KEY = Symbol('appica-dropdown-menu')

export function setDropdownMenuContext(value: DropdownMenuContextValue) {
  setContext(KEY, value)
}

export function getDropdownMenuContext(): DropdownMenuContextValue {
  const ctx = getContext<DropdownMenuContextValue>(KEY)
  if (!ctx) {
    throw new Error('DropdownMenu sub-components must be rendered inside <DropdownMenu>')
  }
  return ctx
}
