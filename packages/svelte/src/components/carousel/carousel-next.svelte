<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import type { CarouselNavPosition } from './carousel-types'

  export type CarouselNextProps = HTMLButtonAttributes & {
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
  import { NEXT_POSITION_CLASSES } from './carousel-tokens'

  let {
    class: className,
    position = 'inside',
    disabled: disabledProp,
    children,
    onclick,
    ...rest
  }: CarouselNextProps = $props()

  const ctx = useCarousel()
  const disabled = $derived(Boolean(disabledProp) || !ctx.canScrollNext)
</script>

<div
  data-slot="carousel-next-positioner"
  data-orientation={ctx.orientation}
  class={cn(NEXT_POSITION_CLASSES[position], className)}
>
  <button
    type="button"
    data-slot="carousel-next"
    data-disabled={disabled || undefined}
    aria-label="Next slide"
    {disabled}
    onclick={(event) => {
      onclick?.(event)
      if (!event.defaultPrevented) ctx.scrollNext()
    }}
    {...rest}
  >
    {@render children?.()}
  </button>
</div>
