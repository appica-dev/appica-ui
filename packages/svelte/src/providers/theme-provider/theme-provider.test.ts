import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { getThemeScript } from './theme-script'
import ThemeProbe from './theme-probe.test-host.svelte'
import ThemeProviderHost from './theme-provider.test-host.svelte'

afterEach(() => {
  document.documentElement.className = ''
  document.documentElement.style.colorScheme = ''
  localStorage.clear()
})

describe('getThemeScript', () => {
  it('embeds the storage key and reads localStorage + system preference', () => {
    const s = getThemeScript({ storageKey: 'appica-theme' })
    expect(s).toContain('appica-theme')
    expect(s).toContain('localStorage')
    expect(s).toContain('prefers-color-scheme')
    expect(s.startsWith('(')).toBe(true)
  })

  it('inlines a forced theme', () => {
    expect(getThemeScript({ forcedTheme: 'dark' })).toContain('"dark"')
  })
})

describe('ThemeProvider / useTheme', () => {
  it('returns inert values without a provider', () => {
    render(ThemeProbe)
    expect(screen.getByTestId('theme-probe')).toHaveTextContent('none|none|pending')
  })

  it('exposes the default theme and reports mounted after hydration', () => {
    render(ThemeProviderHost, { props: { defaultTheme: 'light', enableSystem: false } })
    expect(screen.getByTestId('theme-probe')).toHaveTextContent('light|light|mounted')
  })

  it('resolves "system" to light/dark via the media query', () => {
    render(ThemeProviderHost, { props: { defaultTheme: 'system', enableSystem: true } })
    expect(screen.getByTestId('theme-probe')).toHaveTextContent('system|light|mounted')
  })

  it('applies the theme class to <html> and persists as a raw string on change', async () => {
    const user = userEvent.setup()
    render(ThemeProviderHost, { props: { defaultTheme: 'light', enableSystem: false } })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.classList.contains('light')).toBe(true)

    await user.click(screen.getByTestId('theme-probe'))

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('forcedTheme overrides storage and system', () => {
    localStorage.setItem('theme', 'light')
    render(ThemeProviderHost, { props: { forcedTheme: 'dark' } })
    expect(screen.getByTestId('theme-probe')).toHaveTextContent(/\|dark\|/)
  })

  it('nested ThemeProvider is a passthrough (outer wins)', () => {
    render(ThemeProviderHost, { props: { forcedTheme: 'dark', nested: true } })
    expect(screen.getByTestId('theme-probe')).toHaveTextContent(/\|dark\|/)
  })
})
