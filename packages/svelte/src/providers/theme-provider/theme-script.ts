export interface ThemeScriptOptions {
  storageKey?: string
  defaultTheme?: string
  forcedTheme?: string
  themes?: string[]
  value?: Record<string, string>
  enableSystem?: boolean
  enableColorScheme?: boolean
}

function themeScript(
  storageKey: string,
  defaultTheme: string,
  forcedTheme: string | null,
  themes: string[],
  value: Record<string, string> | null,
  enableSystem: boolean,
  enableColorScheme: boolean,
) {
  const el = document.documentElement
  const system = ['light', 'dark']
  const classFor = (t: string) => (value && value[t] ? value[t] : t)
  const updateDOM = (theme: string) => {
    el.classList.remove(...themes.map(classFor))
    el.classList.add(classFor(theme))
    if (enableColorScheme && system.indexOf(theme) !== -1) {
      el.style.colorScheme = theme
    }
  }
  if (forcedTheme) {
    updateDOM(forcedTheme)
  } else {
    try {
      const stored = localStorage.getItem(storageKey) || defaultTheme
      const resolved =
        enableSystem && stored === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : stored
      updateDOM(resolved)
    } catch (e) {
      // storage unavailable - leave the default
    }
  }
}

/**
 * Returns the inline no-flash script as a string, ready to drop into a
 * `<script>` before hydration.
 */
export function getThemeScript(options: ThemeScriptOptions = {}): string {
  const {
    storageKey = 'theme',
    enableSystem = true,
    defaultTheme = enableSystem ? 'system' : 'light',
    forcedTheme,
    themes = ['light', 'dark'],
    value,
    enableColorScheme = true,
  } = options
  const args = JSON.stringify([
    storageKey,
    defaultTheme,
    forcedTheme ?? null,
    themes,
    value ?? null,
    enableSystem,
    enableColorScheme,
  ]).slice(1, -1)
  return `(${themeScript.toString()})(${args})`
}
