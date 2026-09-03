<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { fade } from 'svelte/transition'
  import { Dialog as BitsDialog } from 'bits-ui'
  import { splitModalProps } from '../../internal/modal'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { buttonVariants } from '../button/button-variants'
  import { getDrawerContext } from './drawer-context'
  import {
    DRAWER_ENTER_MS,
    DRAWER_EXIT_MS,
    DRAWER_OVERLAY_MS,
    drawerEnterEasing,
    drawerExitEasing,
    drawerSlide,
  } from './drawer-slide'
  import {
    CONTENT_RECLAIM_SIDE,
    FRAME_PAD_SIDE,
    HANDLE_SIDE,
    POPUP_SIDE,
    SHADOW_SIDE,
    VIEWPORT_SIDE,
  } from './drawer-variants'

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
    /** Render the dimmed backdrop. Defaults to `true` at the top level, off when nested. */
    backdrop?: boolean
    /**
     * Wrap the panel in a translucent glass frame. Needs `backdrop`: without one the panel
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
    backdrop,
    frame = true,
    backdropProps,
    viewportProps,
    children,
    ...rest
  }: Props = $props()

  const ctx = getDrawerContext()
  const side = $derived(ctx.side)
  const depth = $derived(ctx.depth)
  const showBackdrop = $derived(backdrop ?? depth <= 1)
  const showFrame = $derived(frame && showBackdrop)
  const split = $derived(splitModalProps(rest))
  const keepMounted = $derived(split.keepMounted)
  const reduced = useReducedMotion()
  const enterMs = $derived(reduced.current ? 0 : DRAWER_ENTER_MS)
  const exitMs = $derived(reduced.current ? 0 : DRAWER_EXIT_MS)
  const overlayMs = $derived(reduced.current ? 0 : DRAWER_OVERLAY_MS)
  const enterParams = $derived({ side, duration: enterMs, easing: drawerEnterEasing })
  const exitParams = $derived({ side, duration: exitMs, easing: drawerExitEasing })
  const overlayParams = $derived({ duration: overlayMs, easing: drawerExitEasing })
  const classes = $derived(
    cn(
      'relative flex min-h-0 flex-col rounded-2xl border pointer-events-auto',
      showFrame
        ? 'before:bg-background border-white/15 bg-white/10 p-1.5 backdrop-blur-sm'
        : 'bg-background border-border-overlay before:bg-background-strong',
      'isolate outline-none',
      !showFrame && SHADOW_SIDE[side],
      FRAME_PAD_SIDE[side],
      HANDLE_SIDE[side],
      POPUP_SIDE[side],
      className,
    ),
  )
</script>

<BitsDialog.Portal {...asBitsAttrs(split.portal)}>
  {#if showBackdrop}
    <BitsDialog.Overlay
      forceMount
      data-slot="drawer-backdrop"
      class={cn(
        'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm supports-[-webkit-touch-callout:none]:absolute',
        backdropProps?.class as string | undefined,
      )}
      {...asBitsAttrs(backdropProps ?? {})}
    >
      {#snippet child({ props, open })}
        {#if open || keepMounted}
          <div {...props} transition:fade={overlayParams}></div>
        {/if}
      {/snippet}
    </BitsDialog.Overlay>
  {/if}
  <BitsDialog.Content
    forceMount
    data-slot="drawer-popup"
    data-frame={showFrame ? '' : undefined}
    data-side={side}
    class={classes}
    {...asBitsAttrs(split.popup)}
  >
    {#snippet child({ props, open })}
      {#if open || keepMounted}
        <div
          data-slot="drawer-viewport"
          data-side={side}
          class={cn(
            'pointer-events-none fixed inset-0 z-50 flex overflow-clip p-2',
            VIEWPORT_SIDE[side],
            viewportProps?.class as string | undefined,
          )}
          {...asBitsAttrs(viewportProps ?? {})}
        >
          <div {...props} in:drawerSlide={enterParams} out:drawerSlide={exitParams}>
            <div
              data-slot="drawer-content"
              class={cn(
                'relative flex min-h-0 flex-1 flex-col not-has-[>[data-slot=drawer-footer]]:pb-6 not-has-[>[data-slot=drawer-header]]:pt-6 [&>[data-slot=drawer-header]+[data-slot=drawer-footer]]:pt-0',
                showFrame ? 'bg-background rounded-[calc(var(--radius-2xl)*5/6)]' : CONTENT_RECLAIM_SIDE[side],
              )}
            >
              {@render children?.()}
              {#if closeButton}
                <BitsDialog.Close
                  aria-label={closeLabel}
                  data-slot="drawer-close-button"
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
          </div>
        </div>
      {/if}
    {/snippet}
  </BitsDialog.Content>
</BitsDialog.Portal>
