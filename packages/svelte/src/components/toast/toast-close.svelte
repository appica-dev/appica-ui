<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getToastViewContext } from './toast-position'
  import { getToastItemContext } from './toast-item-context'
  import { useToastManager } from './toast-manager.svelte'

  export type ToastCloseProps = HTMLButtonAttributes & {
    /**
     * Accessible label for the dismiss control.
     * @default 'Dismiss'
     */
    closeLabel?: string
    children?: Snippet
  }

  let { class: className, closeLabel = 'Dismiss', children, onclick, onfocus, onblur, ...rest }: ToastCloseProps = $props()

  const manager = useToastManager()
  const view = getToastViewContext()
  const item = getToastItemContext()
  let hasFocus = $state(false)
  const hidden = $derived(!view.expanded && !hasFocus)

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(event)
    if (event.defaultPrevented) return
    const id = item?.toast.id
    if (id) manager.close(id)
  }
</script>

<button
  type="button"
  aria-label={closeLabel}
  aria-hidden={hidden ? 'true' : undefined}
  tabindex={hidden ? -1 : 0}
  data-slot="toast-close"
  class={cn(
    'text-foreground-muted -me-1 -mt-1 cursor-pointer self-start rounded-md p-1 outline-none [grid-area:close] motion-safe:transition-colors',
    'hover:text-foreground-intense',
    'focus-visible:ring-ring focus-visible:ring-2',
    className,
  )}
  {...rest}
  onclick={handleClick}
  onfocus={(event) => {
    hasFocus = true
    onfocus?.(event)
  }}
  onblur={(event) => {
    hasFocus = false
    onblur?.(event)
  }}
>
  {#if children}
    {@render children()}
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="size-4">
      <path
        d="M11.523 3.522c.264-.264.691-.264.955 0s.264.691 0 .955L8.955 8l3.522 3.522c.264.264.264.691 0 .955s-.691.264-.955 0L8 8.955l-3.522 3.522c-.264.264-.691.264-.955 0s-.264-.691 0-.955L7.045 8 3.522 4.478c-.264-.264-.264-.691 0-.955s.691-.264.955 0L8 7.045l3.523-3.522z"
      />
    </svg>
  {/if}
</button>
