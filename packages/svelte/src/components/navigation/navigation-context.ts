import { getContext, setContext } from 'svelte'

export type NavigationOrientation = 'horizontal' | 'vertical'
export type NavigationSize = 'sm' | 'md' | 'lg'
export type NavigationVariant = 'pill' | 'line' | 'indicator'
export type NavigationActiveLink = string | number | null

export interface NavigationContextValue {
  orientation: () => NavigationOrientation
  variant: () => NavigationVariant
  size: () => NavigationSize
  activeLink: () => NavigationActiveLink
}

const KEY = Symbol('appica-navigation')

export function setNavigationContext(value: NavigationContextValue) {
  setContext(KEY, value)
}

export function getNavigationContext(): NavigationContextValue | undefined {
  return getContext<NavigationContextValue>(KEY)
}

export const HORIZONTAL_GAP: Partial<Record<NavigationVariant, string>> = {
  pill: 'gap-0.5',
  line: 'gap-7',
}

export const VERTICAL_GAP: Partial<Record<NavigationVariant, string>> = {
  pill: 'gap-0.5',
}
