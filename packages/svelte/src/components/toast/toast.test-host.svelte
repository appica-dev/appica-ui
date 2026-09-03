<script lang="ts">
  import ToastProvider from './toast-provider.svelte'
  import Toaster from './toaster.svelte'
  import ToastTrigger from './toast.test-trigger.svelte'
  import type { ToastPosition } from './toast-manager.svelte'

  let {
    title = 'Hello',
    description = 'World',
    timeout,
    position,
    progress,
    withAction,
    icon,
    thumbnail,
    toastProgress,
    withPromise,
    limit,
    providerTimeout,
    priority,
    onAction,
  }: {
    title?: string
    description?: string
    timeout?: number
    position?: ToastPosition
    progress?: boolean
    withAction?: boolean
    icon?: string
    thumbnail?: string
    toastProgress?: boolean
    withPromise?: boolean
    limit?: number
    providerTimeout?: number
    priority?: 'low' | 'high'
    onAction?: (event: MouseEvent) => void
  } = $props()
</script>

<ToastProvider timeout={providerTimeout} {limit}>
  <ToastTrigger
    {title}
    {description}
    {timeout}
    {withAction}
    {icon}
    {thumbnail}
    {toastProgress}
    {withPromise}
    {priority}
    {onAction}
  />
  <Toaster {position} {progress} />
</ToastProvider>
