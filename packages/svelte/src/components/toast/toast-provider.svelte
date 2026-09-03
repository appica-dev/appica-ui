<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { createToastManager, setToastManager, type ToastManager } from './toast-manager.svelte'

  export type ToastProviderProps = {
    /**
     * Existing manager. Created automatically when omitted.
     */
    manager?: ToastManager
    /**
     * A manager from `createToastManager()` to drive toasts from outside the component tree. Same as `manager`.
     */
    toastManager?: ToastManager
    /**
     * Default auto-dismiss duration in milliseconds. `0` disables auto-dismiss.
     * @default 5000
     */
    timeout?: number
    /**
     * Maximum number of toasts shown at once. Older toasts stay mounted with `data-limited`.
     * @default 3
     */
    limit?: number
    children?: Snippet
  }

  let { manager, toastManager, timeout = 5000, limit = 3, children }: ToastProviderProps = $props()

  const fallback = createToastManager()
  const active = untrack(() => toastManager ?? manager ?? fallback)
  setToastManager(active)

  $effect(() => {
    active.configure({ timeout, limit })
  })
</script>

{@render children?.()}
