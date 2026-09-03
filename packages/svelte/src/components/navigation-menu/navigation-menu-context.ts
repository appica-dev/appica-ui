import { getContext, setContext } from 'svelte'

export type NavigationMenuVariant = 'pill' | 'line'
export type NavigationMenuSize = 'sm' | 'md' | 'lg'
export type NavigationMenuIconKind = 'chevron' | 'caret' | 'plus' | false
export type NavigationMenuOrientation = 'horizontal' | 'vertical'

export interface NavigationMenuContextValue {
  variant: NavigationMenuVariant
  size: NavigationMenuSize
  icon: NavigationMenuIconKind
  orientation: NavigationMenuOrientation
  backdrop: boolean
  morph: boolean
  isOpen: () => boolean
}

const KEY = Symbol('appica-navigation-menu')
const CONTENT_KEY = Symbol('appica-navigation-menu-content')

export function setNavigationMenuContext(value: NavigationMenuContextValue) {
  setContext(KEY, value)
}

export function getNavigationMenuContext(): NavigationMenuContextValue {
  const ctx = getContext<NavigationMenuContextValue>(KEY)
  if (!ctx) {
    throw new Error('NavigationMenu sub-components must be rendered inside <NavigationMenu>')
  }
  return ctx
}

export function setNavigationMenuContentContext(inside: boolean) {
  setContext(CONTENT_KEY, inside)
}

export function getNavigationMenuInContent(): boolean {
  return getContext<boolean>(CONTENT_KEY) ?? false
}
