<script lang="ts">
  import { useToastManager } from './toast-manager.svelte'

  let {
    title = 'Hello',
    description = 'World',
    timeout,
    withAction,
    icon,
    thumbnail,
    toastProgress,
    withPromise,
    priority,
    onAction,
    label = 'Show toast',
  }: {
    title?: string
    description?: string
    timeout?: number
    withAction?: boolean
    icon?: string
    thumbnail?: string
    toastProgress?: boolean
    withPromise?: boolean
    priority?: 'low' | 'high'
    onAction?: (event: MouseEvent) => void
    label?: string
  } = $props()

  const manager = useToastManager()

  function showToast() {
    manager.add({
      title,
      description,
      timeout,
      progress: toastProgress,
      priority,
      ...(icon || thumbnail
        ? { data: { icon, thumbnail, thumbnailAlt: thumbnail ? 'Thumb' : undefined } }
        : {}),
      ...(withAction ? { actionProps: { children: 'Do it', onclick: onAction } } : {}),
    })
  }

  function showPromise() {
    void manager.promise(
      new Promise((resolve) => {
        setTimeout(() => resolve('ok'), 30)
      }),
      {
        loading: { title: 'Loading', description: 'Working' },
        success: { title: 'Done', description: 'Finished' },
        error: { title: 'Fail', description: 'Broke' },
      },
    )
  }
</script>

<button type="button" onclick={showToast}>{label}</button>
{#if withPromise}
  <button type="button" onclick={showPromise}>Promise toast</button>
{/if}
