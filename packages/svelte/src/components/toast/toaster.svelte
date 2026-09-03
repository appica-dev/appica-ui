<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import Thumbnail from '../thumbnail/thumbnail.svelte'
  import { asBitsAttrs } from '../../internal/utils'
  import { toastStackGapPx } from './toast-variants'
  import { isToastIconSnippet, useToastManager, type ToastPayload, type ToastPosition } from './toast-manager.svelte'
  import ToastPortal from './toast-portal.svelte'
  import ToastViewport from './toast-viewport.svelte'
  import Toast from './toast.svelte'
  import ToastIcon from './toast-icon.svelte'
  import ToastTitle from './toast-title.svelte'
  import ToastDescription from './toast-description.svelte'
  import ToastActions from './toast-actions.svelte'
  import ToastAction from './toast-action.svelte'
  import ToastStatusIcon from './toast-status-icon.svelte'

  export type ToasterProps = HTMLAttributes<HTMLDivElement> & {
    /**
     * Where the stack is anchored; also sets the default swipe-to-dismiss directions.
     * @default 'bottom-right'
     */
    position?: ToastPosition
    /**
     * Opt in to a countdown progress bar on auto-dismissing toasts. Individual toasts can
     * override this with `progress` on `add()`.
     * @default false
     */
    progress?: boolean
    /**
     * Provider default (ms) used to size the progress bar for toasts that don't set their own `timeout`.
     * Match your `ToastProvider`'s `timeout`.
     * @default 5000
     */
    timeout?: number
    /**
     * Portal target - scope the toasts to a specific element.
     * @default document.body
     */
    container?: Element | string
    /** Escape hatch forwarded to the underlying `ToastPortal`. */
    portalProps?: Record<string, unknown>
  }

  let {
    position = 'bottom-right',
    progress = false,
    timeout,
    class: className,
    container,
    portalProps,
    ...rest
  }: ToasterProps = $props()

  const manager = useToastManager()
  const providerTimeout = $derived(timeout ?? manager.timeout)

  function offsetY(index: number) {
    let sum = 0
    for (let i = 0; i < index; i++) {
      sum += manager.toasts[i]?.height ?? 0
    }
    return sum
  }

  function visibleIndex(index: number) {
    let count = 0
    for (let i = 0; i < index; i++) {
      if (!manager.toasts[i]?.closing) count += 1
    }
    return count
  }

  const frontmostHeight = $derived.by(() => {
    const front = manager.toasts.find((toast) => !toast.closing)
    return front?.height ?? 0
  })

  const collapsedHeight = $derived.by(() => {
    const list = manager.toasts.filter((toast) => !toast.limited)
    if (list.length === 0) return 0
    return frontmostHeight + Math.max(0, list.length - 1) * toastStackGapPx
  })

  const expandedHeight = $derived.by(() => {
    const list = manager.toasts.filter((toast) => !toast.limited)
    if (list.length === 0) return 0
    const measured = list.reduce((sum, toast) => sum + (toast.height ?? 0), 0)
    return measured + Math.max(0, list.length - 1) * toastStackGapPx
  })

  function leadingChrome(data: ToastPayload | undefined) {
    if (!data) return undefined
    if (data.thumbnail) {
      return { type: 'thumbnail' as const, src: data.thumbnail, alt: data.thumbnailAlt ?? '' }
    }
    if (isToastIconSnippet(data.icon)) {
      return { type: 'snippet' as const, snippet: data.icon }
    }
    if (data.icon) {
      return { type: 'status' as const, kind: data.icon }
    }
    return undefined
  }
</script>

<ToastPortal to={container} {...asBitsAttrs(portalProps ?? {})}>
  <ToastViewport
    {position}
    class={className}
    {...rest}
    style="--stack-collapsed: {collapsedHeight}px; --stack-expanded: {expandedHeight}px"
  >
    {#each manager.toasts as toast, index (toast.id)}
      {@const chrome = leadingChrome(toast.data)}
      <Toast
        {toast}
        {position}
        progress={toast.progress ?? progress}
        providerTimeout={providerTimeout}
        index={toast.closing ? index : visibleIndex(index)}
        ownHeight={toast.height ?? 0}
        {frontmostHeight}
        offsetY={offsetY(index)}
        onHeight={(height) => manager.setHeight(toast.id, height)}
      >
        {#if chrome?.type === 'thumbnail'}
          <ToastIcon>
            <Thumbnail size="sm" src={chrome.src} alt={chrome.alt} />
          </ToastIcon>
        {:else if chrome?.type === 'snippet'}
          <ToastIcon>{@render chrome.snippet()}</ToastIcon>
        {:else if chrome?.type === 'status'}
          <ToastIcon>
            <ToastStatusIcon kind={chrome.kind} />
          </ToastIcon>
        {/if}
        {#if toast.title}
          <ToastTitle>{toast.title}</ToastTitle>
        {/if}
        {#if toast.description}
          <ToastDescription>{toast.description}</ToastDescription>
        {/if}
        {#if toast.actionProps}
          <ToastActions>
            <ToastAction />
          </ToastActions>
        {/if}
      </Toast>
    {/each}
  </ToastViewport>
</ToastPortal>
