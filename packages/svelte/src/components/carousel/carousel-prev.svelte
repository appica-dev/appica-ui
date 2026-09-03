<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import type { CarouselNavPosition } from './carousel-types'

  export type CarouselPrevProps = HTMLButtonAttributes & {
    /**
     * Where the control sits relative to the viewport.
     * @default 'inside'
     */
    position?: CarouselNavPosition
    children?: Snippet
  }
</script>

<script lang="ts">
  import { cn } from '../../internal/utils'
  import { useCarousel } from './carousel-context'
  import { PREV_POSITION_CLASSES } from './carousel-tokens'

  let {
    class: className,
    position = 'inside',
    disabled: disabledProp,
    children,
    onclick,
    ...rest
  }: CarouselPrevProps = $props()

  const ctx = useCarousel()
  const disabled = $derived(Boolean(disabledProp) || !ctx.canScrollPrev)
</script>

<div
  data-slot="carousel-prev-positioner"
  data-orientation={ctx.orientation}
  class={cn(PREV_POSITION_CLASSES[position], className)}
>
  <button
    type="button"
    data-slot="carousel-prev"
    data-disabled={disabled || undefined}
    aria-label="Previous slide"
    {disabled}
    onclick={(event) => {
      onclick?.(event)
      if (!event.defaultPrevented) ctx.scrollPrev()
    }}
    {...rest}
  >
    {@render children?.()}
  </button>
</div>
