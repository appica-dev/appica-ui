<script lang="ts">
  import type { Snippet } from 'svelte'
  import { useLocalStorage } from '../../hooks/use-local-storage/use-local-storage.svelte'
  import { useMediaQuery } from '../../hooks/use-media-query/use-media-query'
  import { getThemeScript } from './theme-script'
  import { hasThemeContext, setThemeContext, type ThemeContextValue } from './theme-context'

  const MEDIA = '(prefers-color-scheme: dark)'
  const SYSTEM_THEMES = ['light', 'dark']
  const DEFAULT_THEMES = ['light', 'dark']
  const RAW_STRING = { serializer: (v: string) => v, deserializer: (v: string) => v }

  interface Props {
    children?: Snippet
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

  let {
    children,
    themes = DEFAULT_THEMES,
    forcedTheme,
    enableSystem = true,
    disableTransitionOnChange = false,
    enableColorScheme = true,
    storageKey = 'theme',
    defaultTheme = enableSystem ? 'system' : 'light',
    value,
    nonce,
  }: Props = $props()

  const nested = hasThemeContext()

  // svelte-ignore state_referenced_locally
  const stored = useLocalStorage<string>(storageKey, defaultTheme, RAW_STRING)
  const systemDark = useMediaQuery(MEDIA)
  // eslint-disable-next-line svelte/prefer-writable-derived -- one-shot client mount flag; $derived cannot express "after first effect"
  let mounted = $state(false)

  $effect(() => {
    mounted = true
  })

  const systemTheme = $derived(enableSystem ? (systemDark.current ? 'dark' : 'light') : undefined)
  const resolvedTheme = $derived(
    forcedTheme ?? (stored.current === 'system' ? (systemDark.current ? 'dark' : 'light') : stored.current),
  )
  const availableThemes = $derived(enableSystem ? [...themes, 'system'] : themes)

  function setTheme(next: string | ((prev: string) => string)) {
    stored.set(next)
  }

  const ctx: ThemeContextValue = {
    get theme() {
      return stored.current
    },
    setTheme,
    get resolvedTheme() {
      return resolvedTheme
    },
    get systemTheme() {
      return systemTheme
    },
    get themes() {
      return availableThemes
    },
    get forcedTheme() {
      return forcedTheme
    },
    get mounted() {
      return mounted
    },
  }

  if (!nested) setThemeContext(ctx)

  function disableAnimation(scriptNonce?: string) {
    const css = document.createElement('style')
    if (scriptNonce) css.setAttribute('nonce', scriptNonce)
    css.appendChild(
      document.createTextNode(
        '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}',
      ),
    )
    document.head.appendChild(css)
    return () => {
      ;(() => window.getComputedStyle(document.body))()
      setTimeout(() => {
        document.head.removeChild(css)
      }, 1)
    }
  }

  $effect(() => {
    if (nested || !resolvedTheme) return
    // Apply on the first run too. Svelte `{@html}` scripts in `<svelte:head>`
    // do not execute in a client-only SPA, so skipping mount (as React does
    // after its blocking script) would leave `<html>` without a theme class.
    const classFor = (t: string) => (value && value[t] ? value[t] : t)
    const enable = disableTransitionOnChange ? disableAnimation(nonce) : null
    const el = document.documentElement
    el.classList.remove(...themes.map(classFor))
    el.classList.add(classFor(resolvedTheme))
    if (enableColorScheme && SYSTEM_THEMES.includes(resolvedTheme)) {
      el.style.colorScheme = resolvedTheme
    }
    enable?.()
  })

  const scriptHtml = $derived(
    nested
      ? ''
      : getThemeScript({
          storageKey,
          defaultTheme,
          forcedTheme,
          themes,
          value,
          enableSystem,
          enableColorScheme,
        }),
  )
</script>

<svelte:head>
  {#if !nested}
    {@html `<script${nonce ? ` nonce="${nonce}"` : ''}>${scriptHtml}</script>`}
  {/if}
</svelte:head>

{@render children?.()}
