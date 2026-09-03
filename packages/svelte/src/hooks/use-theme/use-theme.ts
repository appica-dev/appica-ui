import { getThemeContext, type ThemeContextValue } from '../../providers/theme-provider/theme-context'

export type UseThemeReturn = ThemeContextValue

/**
 * Read and control the active theme. Returns the stored `theme`, the
 * `resolvedTheme` (`'system'` resolved to `'light'`/`'dark'`), `systemTheme`,
 * the available `themes`, any `forcedTheme`, a `setTheme` setter, and
 * `mounted` - guard theme-dependent UI (e.g. a sun/moon icon) with `mounted`
 * to avoid hydration mismatches. Returns inert values with no `<ThemeProvider>`.
 */
export function useTheme(): UseThemeReturn {
  return getThemeContext()
}
