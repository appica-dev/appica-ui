import { getContext, setContext } from 'svelte'

export type MenubarSize = 'sm' | 'md' | 'lg'
export type MenubarVariant = 'pill' | 'line'
export type MenubarOrientation = 'horizontal' | 'vertical'

export interface MenubarContextValue {
  size: MenubarSize
  variant: MenubarVariant
  orientation: MenubarOrientation
}

const KEY = Symbol('appica-menubar')

export function setMenubarContext(value: MenubarContextValue) {
  setContext(KEY, value)
}

export function getMenubarContext(): MenubarContextValue {
  const ctx = getContext<MenubarContextValue>(KEY)
  if (!ctx) {
    throw new Error('Menubar sub-components must be rendered inside <Menubar>')
  }
  return ctx
}
