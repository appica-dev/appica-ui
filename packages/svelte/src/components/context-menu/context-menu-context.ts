import { getContext, setContext } from 'svelte'

export type ContextMenuSize = 'sm' | 'md' | 'lg'

export interface ContextMenuContextValue {
  size: ContextMenuSize
}

const KEY = Symbol('appica-context-menu')

export function setContextMenuContext(value: ContextMenuContextValue) {
  setContext(KEY, value)
}

export function getContextMenuContext(): ContextMenuContextValue {
  const ctx = getContext<ContextMenuContextValue>(KEY)
  if (!ctx) {
    throw new Error('ContextMenu sub-components must be rendered inside <ContextMenu>')
  }
  return ctx
}
