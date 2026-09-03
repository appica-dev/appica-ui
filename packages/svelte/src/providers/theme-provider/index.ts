export { default as ThemeProvider } from './theme-provider.svelte'
export { default as ThemeScript } from './theme-script.svelte'
export { getThemeScript } from './theme-script'
export { getThemeContext } from './theme-context'
export type { ThemeContextValue } from './theme-context'
export type { ThemeScriptOptions } from './theme-script'

export interface ThemeProviderProps {
  /**
   * Available theme names
   * @default ['light', 'dark']
   */
  themes?: string[]
  /** Force a theme for the whole subtree (overrides storage + OS) */
  forcedTheme?: string
  /**
   * Respect the OS `prefers-color-scheme`
   * @default true
   */
  enableSystem?: boolean
  /**
   * Suppress CSS transitions during a theme switch
   * @default false
   */
  disableTransitionOnChange?: boolean
  /**
   * Set `color-scheme` on `<html>` so native UI matches
   * @default true
   */
  enableColorScheme?: boolean
  /**
   * `localStorage` key for the persisted choice
   * @default 'theme'
   */
  storageKey?: string
  /** Theme used before a choice is stored */
  defaultTheme?: string
  /** Map a theme name to a custom class applied on `<html>` */
  value?: Record<string, string>
  /** CSP nonce forwarded to the inline script */
  nonce?: string
}
