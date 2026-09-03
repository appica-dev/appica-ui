import { useStorage, type StorageBackend } from '../use-local-storage/use-local-storage.svelte'

export interface UseDismissibleOptions {
  /** Which Web Storage area the dismissal is persisted to. */
  storage?: StorageBackend
}

/**
 * Tracks whether a dismissible surface (banner, callout, etc.) should still be
 * shown, persisting the dismissal under `key`. SSR-safe (`open` is `true` until
 * the stored value is known).
 */
export function useDismissible(key: string, { storage = 'local' }: UseDismissibleOptions = {}) {
  const flag = useStorage<string>(storage, key, '', {
    serializer: (v) => v,
    deserializer: (v) => v,
  })

  return {
    get open() {
      return flag.current !== '1'
    },
    dismiss() {
      flag.set('1')
    },
    reset() {
      flag.remove()
    },
  }
}
