<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Dialog as BitsDialog } from 'bits-ui'
  import { splitModalProps } from '../../internal/modal'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { buttonVariants } from '../button/button-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Render the × button in the corner.
     * @default true
     */
    closeButton?: boolean
    /**
     * Accessible label for the close button.
     * @default 'Close'
     */
    closeLabel?: string
    /**
     * Render the dimmed, blurred backdrop behind the popup.
     * @default true
     */
    backdrop?: boolean
    /**
     * Wrap the popup in a translucent glass frame. Needs `backdrop`: without one the popup
     * is always a plain solid card.
     * @default true
     */
    frame?: boolean
    /**
     * Portal target. Maps to bits-ui Portal `to`.
     * @default document.body
     */
    container?: Element | string
    /**
     * Keep overlay and content mounted while closed so enter/exit animations can run.
     * @default false
     */
    keepMounted?: boolean
    portalProps?: Record<string, unknown>
    backdropProps?: Record<string, unknown>
    viewportProps?: Record<string, unknown>
    children?: Snippet
  }

  let {
    class: className,
    closeButton = true,
    closeLabel = 'Close',
    backdrop = true,
    frame = true,
    backdropProps,
    viewportProps,
    children,
    ...rest
  }: Props = $props()

  const showFrame = $derived(frame && backdrop)
  const split = $derived(splitModalProps(rest))
  const keepMounted = $derived(split.keepMounted)
  const classes = $derived(
    cn(
      'group/dialog-popup relative flex max-h-full min-h-0 w-150 max-w-full flex-col pointer-events-auto',
      'rounded-2xl border',
      showFrame ? 'border-white/15 bg-white/10 p-1.5 backdrop-blur-sm' : 'bg-background border-border-overlay',
      !showFrame && 'shadow-2xl',
      'isolate transform-gpu outline-none',
      'motion-safe:transition-[opacity,scale] motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
      'data-starting-style:motion-safe:scale-95 data-starting-style:motion-safe:opacity-0',
      'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
      'data-nested-open:pointer-events-none data-nested-open:scale-95 data-nested-open:opacity-0',
      className,
    ),
  )
</script>

<BitsDialog.Portal {...asBitsAttrs(split.portal)}>
  {#if backdrop}
    <BitsDialog.Overlay
      data-slot="dialog-backdrop"
      forceMount={keepMounted ? true : undefined}
      class={cn(
        'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm supports-[-webkit-touch-callout:none]:absolute',
        'motion-safe:transition-opacity motion-safe:duration-250 motion-safe:ease-out',
        'data-ending-style:motion-safe:opacity-0 data-starting-style:motion-safe:opacity-0',
        backdropProps?.class as string | undefined,
      )}
      {...asBitsAttrs(backdropProps ?? {})}
    />
  {/if}
  <div
    data-slot="dialog-viewport"
    class={cn(
      'pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4',
      viewportProps?.class as string | undefined,
    )}
    {...asBitsAttrs(viewportProps ?? {})}
  >
    <BitsDialog.Content
      data-slot="dialog-popup"
      data-frame={showFrame ? '' : undefined}
      class={classes}
      forceMount={keepMounted ? true : undefined}
      {...asBitsAttrs(split.popup)}
    >
      <div
        data-slot="dialog-content"
        class={cn(
          'relative flex min-h-0 flex-col overflow-hidden not-has-[>[data-slot=dialog-footer]]:pb-6 not-has-[>[data-slot=dialog-header]]:pt-6 [&>[data-slot=dialog-header]+[data-slot=dialog-footer]]:pt-0',
          showFrame && 'bg-background rounded-[calc(var(--radius-2xl)*5/6)]',
        )}
      >
        {@render children?.()}
        {#if closeButton}
          <BitsDialog.Close
            aria-label={closeLabel}
            data-slot="dialog-close-button"
            class={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'absolute inset-e-3 top-3 z-10')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path
                d="M11.594 3.594c.225-.225.588-.225.813 0s.225.588 0 .812L8.813 8l3.594 3.594c.225.225.225.588 0 .813s-.588.225-.812 0L8 8.812l-3.594 3.594c-.225.225-.588.225-.812 0s-.225-.588 0-.812L7.188 8 3.594 4.406c-.225-.225-.225-.588 0-.812s.588-.225.813 0L8 7.187l3.594-3.594z"
              />
            </svg>
          </BitsDialog.Close>
        {/if}
      </div>
    </BitsDialog.Content>
  </div>
</BitsDialog.Portal>
