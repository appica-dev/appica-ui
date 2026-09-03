export type StorageBackend = 'local' | 'session'

export interface UseStorageOptions<T> {
  /** Serialize a value to its stored string form. Defaults to `JSON.stringify`. */
  serializer?: (value: T) => string
  /** Parse the stored string back into a value. Defaults to `JSON.parse`. */
  deserializer?: (raw: string) => T
}

function getStore(backend: StorageBackend): Storage | null {
  try {
    return backend === 'session' ? window.sessionStorage : window.localStorage
  } catch {
    return null
  }
}

function readStore<T>(backend: StorageBackend, key: string, fallback: T, options: UseStorageOptions<T>): T {
  if (!key || typeof window === 'undefined') return fallback
  let raw: string | null = null
  try {
    raw = getStore(backend)?.getItem(key) ?? null
  } catch {
    raw = null
  }
  if (raw === null) return fallback
  try {
    return options.deserializer ? options.deserializer(raw) : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

/**
 * Reactive Web Storage helper. Call from a component (or `.svelte.ts` module
 * that a component imports) so `$state` is owned by that instance.
 *
 * Read `.current` in a template. First render returns `defaultValue` so SSR
 * and hydration match; the stored value is applied after mount.
 */
export function useStorage<T>(
  backend: StorageBackend,
  key: string,
  defaultValue: T,
  options: UseStorageOptions<T> = {},
) {
  let value = $state(defaultValue)
  let didHydrate = false

  $effect(() => {
    if (didHydrate) return
    didHydrate = true
    value = readStore(backend, key, defaultValue, options)
  })

  function set(update: T | ((prev: T) => T)) {
    if (!key) return
    const next = typeof update === 'function' ? (update as (prev: T) => T)(value) : update
    value = next
    try {
      const raw = options.serializer ? options.serializer(next) : JSON.stringify(next)
      getStore(backend)?.setItem(key, raw)
    } catch {
      // quota, privacy mode, SSR
    }
  }

  function remove() {
    if (!key) return
    value = defaultValue
    try {
      getStore(backend)?.removeItem(key)
    } catch {
      // ignore
    }
  }

  return {
    get current() {
      return value
    },
    set,
    remove,
  }
}

export function useLocalStorage<T>(key: string, defaultValue: T, options?: UseStorageOptions<T>) {
  return useStorage('local', key, defaultValue, options)
}

export function useSessionStorage<T>(key: string, defaultValue: T, options?: UseStorageOptions<T>) {
  return useStorage('session', key, defaultValue, options)
}
