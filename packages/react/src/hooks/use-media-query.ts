'use client'

import { useCallback, useSyncExternalStore } from 'react'

export interface UseMediaQueryOptions {
  /**
   * Value returned on the server and during the first client render before
   * hydration, when `window.matchMedia` is unavailable. Defaults to `false`.
   */
  defaultValue?: boolean
}

/**
 * SSR-safe `matchMedia` hook. Returns whether `query` currently matches and
 * re-renders when it changes. Works in any React environment (Vite, CRA,
 * Next.js, Remix, Astro): on the server and the first client render it returns
 * `defaultValue`, then the real value resolves on hydration via
 * `useSyncExternalStore`.
 */
export function useMediaQuery(query: string, { defaultValue = false }: UseMediaQueryOptions = {}): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
