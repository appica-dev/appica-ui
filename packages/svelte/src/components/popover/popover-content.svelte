<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Popover as BitsPopover } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Side = 'top' | 'bottom' | 'left' | 'right'
  type Align = 'start' | 'center' | 'end'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Preferred side of the trigger.
     * @default 'bottom'
     */
    side?: Side
    /** Distance from the trigger in pixels. */
    sideOffset?: number
    /**
     * Preferred alignment along the side.
     * @default 'center'
     */
    align?: Align
    /** Offset along the alignment axis. */
    alignOffset?: number
    /**
     * Render the pointer and the thicker anchored border.
     * @default true
     */
    arrow?: boolean
    /**
     * Keep the content mounted while closed so enter/exit animations can run.
     * @default false
     */
    keepMounted?: boolean
    children?: Snippet
  }

  let {
    class: className,
    side = 'bottom',
    sideOffset,
    align = 'center',
    alignOffset = 0,
    arrow = true,
    keepMounted = false,
    children,
    ...rest
  }: Props = $props()

  const resolvedOffset = $derived(sideOffset ?? (arrow ? 10 : 6))
  const classes = $derived(
    cn(
      'isolate z-50 bg-background border-border-overlay flex max-w-80 min-w-50 flex-col gap-2 rounded-xl border p-4 shadow-2xl',
      arrow && [
        'data-[side=top]:border-b-2',
        'data-[side=bottom]:border-t-2',
        'data-[side=left]:border-r-2',
        'data-[side=right]:border-l-2',
      ],
      'motion-safe:origin-(--bits-popover-content-transform-origin) motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
      'data-[state=closed]:motion-safe:scale-95 data-[state=closed]:motion-safe:opacity-0',
      className,
    ),
  )
</script>

<BitsPopover.Portal>
  <BitsPopover.Content
    data-slot="popover-content"
    class={classes}
    {side}
    sideOffset={resolvedOffset}
    {align}
    {alignOffset}
    forceMount={keepMounted ? true : undefined}
    {...asBitsAttrs(rest)}
  >
    {@render children?.()}
    {#if arrow}
      <BitsPopover.Arrow
        data-slot="popover-arrow"
        class={cn(
          'flex',
          'data-[side=top]:-bottom-2.25 data-[side=top]:rotate-180',
          'data-[side=bottom]:-top-2.25',
          'data-[side=left]:-right-3.25 data-[side=left]:rotate-90',
          'data-[side=right]:-left-3.25 data-[side=right]:-rotate-90',
        )}
      >
        <svg width="26" height="18" viewBox="0 0 26 18" fill="none" aria-hidden="true">
          <path
            class="text-border-overlay"
            d="M21 9L15.9819 3.36153C14.3897 1.57244 11.5927 1.57413 10.0026 3.36516L5 9"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            class="text-background"
            d="M9.82943 4.57564C11.4308 2.51078 14.5497 2.51076 16.1511 4.5756L20.9774 10.7986C23.0157 13.4269 21.1426 17.25 17.8166 17.25L8.16409 17.25C4.83808 17.25 2.96496 13.4269 5.00325 10.7987L9.82943 4.57564Z"
            fill="currentColor"
          />
        </svg>
      </BitsPopover.Arrow>
    {/if}
  </BitsPopover.Content>
</BitsPopover.Portal>
