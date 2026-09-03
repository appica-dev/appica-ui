<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Tooltip as BitsTooltip } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Side = 'top' | 'bottom' | 'left' | 'right'
  type Align = 'start' | 'center' | 'end'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Preferred side of the trigger.
     * @default 'top'
     */
    side?: Side
    /**
     * Distance from the trigger in pixels.
     */
    sideOffset?: number
    /**
     * Preferred alignment along the side.
     * @default 'center'
     */
    align?: Align
    /** Offset along the alignment axis. */
    alignOffset?: number
    /**
     * Render the pointer.
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
    side = 'top',
    sideOffset,
    align = 'center',
    alignOffset = 0,
    arrow = true,
    keepMounted = false,
    children,
    ...rest
  }: Props = $props()

  const resolvedOffset = $derived(sideOffset ?? (arrow ? 8 : 4))
  const classes = $derived(
    cn(
      'isolate z-50 bg-background-inverse text-foreground-inverse rounded-xs px-3 py-1.5 text-xs shadow-md',
      'motion-safe:origin-(--bits-tooltip-content-transform-origin) motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
      'data-[state=closed]:motion-safe:scale-95 data-[state=closed]:motion-safe:opacity-0',
      'data-[state=delayed-open]:motion-safe:scale-100 data-[state=instant-open]:motion-safe:scale-100',
      className,
    ),
  )
</script>

<BitsTooltip.Portal>
  <BitsTooltip.Content
    data-slot="tooltip-content"
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
      <BitsTooltip.Arrow
        data-slot="tooltip-arrow"
        class={cn(
          'bg-background-inverse fill-background-inverse size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]',
          'data-[side=top]:-bottom-2.5',
          'data-[side=bottom]:top-1',
          'data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2',
          'data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2',
        )}
      />
    {/if}
  </BitsTooltip.Content>
</BitsTooltip.Portal>
