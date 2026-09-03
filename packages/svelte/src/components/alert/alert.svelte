<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn, commitBindableChange } from '../../internal/utils'
  import { useDismissible } from '../../hooks/use-dismissible/use-dismissible.svelte'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { setAlertVariant } from './alert-context'
  import { alertVariants, type AlertVariant } from './alert-variants'

  type AlertLayout = 'block' | 'inline'

  export type AlertProps = HTMLAttributes<HTMLDivElement> & {
    /**
     * Color scheme; also drives the `AlertIcon` accent.
     * @default 'default'
     */
    variant?: AlertVariant
    /**
     * Stack the parts (`block`) or flow them on one row when wide enough (`inline`).
     * @default 'block'
     */
    layout?: AlertLayout
    /**
     * Render a close button that hides the alert (with an exit animation).
     * @default false
     */
    dismissible?: boolean
    /** Controlled visibility. Pair with `onOpenChange` or `bind:open`. */
    open?: boolean
    /** Called when the alert is dismissed (with `false`). */
    onOpenChange?: (open: boolean) => void
    /** Remember the dismissal under this key so the alert stays hidden on return (uncontrolled). */
    persistKey?: string
    /**
     * Which Web Storage backs `persistKey`.
     * @default 'local'
     */
    persistStorage?: 'local' | 'session'
    /**
     * Accessible label for the close button.
     * @default 'Dismiss'
     */
    closeLabel?: string
    children?: Snippet
  }

  let {
    variant = 'default',
    layout = 'block',
    dismissible = false,
    open = $bindable(),
    onOpenChange,
    persistKey,
    persistStorage = 'local',
    closeLabel = 'Dismiss',
    role = 'alert',
    class: className,
    children,
    ...rest
  }: AlertProps = $props()

  setAlertVariant(() => variant)

  const reduced = useReducedMotion()
  let internalOpen = $state(true)
  // svelte-ignore state_referenced_locally
  const persisted = useDismissible(persistKey ?? '', { storage: persistStorage })

  const isControlled = $derived(open !== undefined)
  const usingPersisted = $derived(!isControlled && persistKey != null)
  const actualOpen = $derived(isControlled ? open : usingPersisted ? persisted.open : internalOpen)

  function handleDismiss() {
    if (usingPersisted) {
      persisted.dismiss()
      onOpenChange?.(false)
      return
    }
    commitBindableChange({
      next: false,
      bound: open,
      setBound: (value) => {
        open = value
      },
      setInner: (value) => {
        internalOpen = value
      },
      onChange: onOpenChange,
    })
  }

  function dismissTransition(_node: Element) {
    const skip = reduced.current
    return {
      duration: skip ? 0 : 320,
      css: (t: number) => {
        const u = 1 - t
        return `opacity: ${t}; transform: scale(${0.88 + 0.12 * t}); filter: blur(${12 * u}px); height: ${t * 100}%; overflow: hidden`
      },
    }
  }
</script>

{#if actualOpen}
  <div class="@container overflow-hidden" out:dismissTransition>
    <div {role} data-slot="alert" data-layout={layout} class={cn(alertVariants({ variant }), className)} {...rest}>
      {@render children?.()}
      {#if dismissible}
        <button
          type="button"
          aria-label={closeLabel}
          data-slot="alert-close"
          onclick={handleDismiss}
          class={cn(
            'text-foreground-muted cursor-pointer rounded-md p-1 transition-colors outline-none [grid-area:close]',
            'hover:text-foreground-intense',
            'focus-visible:ring-ring focus-visible:ring-2',
            'self-start @min-[460px]:group-data-[layout=inline]/alert:self-center',
            'ms-3 -me-1 -mt-1 @min-[460px]:group-data-[layout=inline]/alert:my-0',
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="size-4">
            <path
              d="M11.523 3.522c.264-.264.691-.264.955 0s.264.691 0 .955L8.955 8l3.522 3.522c.264.264.264.691 0 .955s-.691.264-.955 0L8 8.955l-3.522 3.522c-.264.264-.691.264-.955 0s-.264-.691 0-.955L7.045 8 3.522 4.478c-.264-.264-.264-.691 0-.955s.691-.264.955 0L8 7.045l3.523-3.522z"
            />
          </svg>
        </button>
      {/if}
    </div>
  </div>
{/if}
