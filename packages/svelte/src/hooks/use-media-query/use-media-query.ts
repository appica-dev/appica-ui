import { MediaQuery } from 'svelte/reactivity'

export interface UseMediaQueryOptions {
  /**
   * Value returned on the server and during the first client render before
   * hydration, when `window.matchMedia` is unavailable. Defaults to `false`.
   */
  defaultValue?: boolean
}

/**
 * SSR-safe `matchMedia` wrapper. Read `.current` in a template or `$derived`
 * to subscribe. On the server it returns `defaultValue`.
 */
export function useMediaQuery(query: string, { defaultValue = false }: UseMediaQueryOptions = {}): MediaQuery {
  return new MediaQuery(query, defaultValue)
}
