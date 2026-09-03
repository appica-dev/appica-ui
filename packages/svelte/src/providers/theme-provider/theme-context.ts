import { getContext, setContext } from 'svelte'

export interface ThemeContextValue {
  /** The chosen theme, possibly `'system'`. */
  theme: string | undefined
  setTheme: (value: string | ((prev: string) => string)) => void
  /** The theme actually applied - `'system'` resolved to `'light'`/`'dark'`. */
  resolvedTheme: string | undefined
  systemTheme: 'light' | 'dark' | undefined
  themes: string[]
  forcedTheme: string | undefined
  /** `false` until the client has mounted - guard theme-dependent UI with this. */
  mounted: boolean
}

const defaultContext: ThemeContextValue = {
  theme: undefined,
  setTheme: () => {},
  resolvedTheme: undefined,
  systemTheme: undefined,
  themes: [],
  forcedTheme: undefined,
  mounted: false,
}

const KEY = Symbol('appica-theme')

export function setThemeContext(value: ThemeContextValue) {
  setContext(KEY, value)
}

export function getThemeContext(): ThemeContextValue {
  return getContext<ThemeContextValue>(KEY) ?? defaultContext
}

export function hasThemeContext(): boolean {
  return getContext<ThemeContextValue>(KEY) != null
}
