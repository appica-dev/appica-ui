<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { AlertDialog as BitsAlertDialog } from 'bits-ui'
  import { splitModalProps } from '../../internal/modal'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & {
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
      'group/alert-dialog-popup relative flex max-h-full min-h-0 w-100 max-w-full flex-col pointer-events-auto',
      'rounded-2xl border',
      showFrame
        ? cn(
            'border-white/15 bg-white/10 p-1.5 backdrop-blur-sm',
            'data-nested:border-border-overlay data-nested:bg-background data-nested:p-0 data-nested:shadow-2xl data-nested:backdrop-blur-none',
          )
        : 'bg-background border-border-overlay',
      !showFrame && 'shadow-2xl',
      'isolate transform-gpu outline-none',
      'motion-safe:transition-[opacity,scale] motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
      'data-starting-style:motion-safe:scale-95 data-starting-style:motion-safe:opacity-0',
      'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
      className,
    ),
  )
</script>

<BitsAlertDialog.Portal {...asBitsAttrs(split.portal)}>
  {#if backdrop}
    <BitsAlertDialog.Overlay
      data-slot="alert-dialog-backdrop"
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
    data-slot="alert-dialog-viewport"
    class={cn(
      'pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4',
      viewportProps?.class as string | undefined,
    )}
    {...asBitsAttrs(viewportProps ?? {})}
  >
    <BitsAlertDialog.Content
      data-slot="alert-dialog-popup"
      data-frame={showFrame ? '' : undefined}
      class={classes}
      forceMount={keepMounted ? true : undefined}
      {...asBitsAttrs(split.popup)}
    >
      <div
        data-slot="alert-dialog-content"
        class={cn(
          'flex min-h-0 flex-col overflow-hidden not-has-[>[data-slot=alert-dialog-footer]]:pb-6 not-has-[>[data-slot=alert-dialog-header]]:pt-6 [&>[data-slot=alert-dialog-header]+[data-slot=alert-dialog-footer]]:pt-0',
          showFrame &&
            cn(
              'bg-background rounded-[calc(var(--radius-2xl)*5/6)]',
              'group-data-nested/alert-dialog-popup:rounded-none group-data-nested/alert-dialog-popup:bg-transparent',
            ),
        )}
      >
        {@render children?.()}
      </div>
    </BitsAlertDialog.Content>
  </div>
</BitsAlertDialog.Portal>
