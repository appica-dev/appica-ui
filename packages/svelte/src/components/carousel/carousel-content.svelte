<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  export type CarouselContentProps = HTMLAttributes<HTMLDivElement> & {
    /** Props for the scroll viewport, the element that clips the track. */
    viewportProps?: HTMLAttributes<HTMLDivElement>
    children?: Snippet
  }
</script>

<script lang="ts">
  import emblaCarouselSvelte from 'embla-carousel-svelte'
  import type { CarouselApi } from './carousel-types'
  import { cn } from '../../internal/utils'
  import { useCarousel } from './carousel-context'

  let { class: className, viewportProps, children, ...rest }: CarouselContentProps = $props()

  const ctx = useCarousel()
  const viewportClass = $derived(viewportProps?.class)
  const viewportRest = $derived.by(() => {
    if (!viewportProps) return {}
    const { class: _className, ...restProps } = viewportProps
    return restProps
  })
  const emblaConfig = $derived({ options: ctx.options, plugins: ctx.plugins })

  function onEmblaInit(event: Event) {
    ctx.setApi((event as CustomEvent<CarouselApi>).detail)
  }
</script>

<div
  use:emblaCarouselSvelte={emblaConfig}
  onemblainit={onEmblaInit}
  data-slot="carousel-viewport"
  data-orientation={ctx.orientation}
  data-auto-height={ctx.autoHeight || undefined}
  class={cn(
    'overflow-hidden',
    ctx.autoHeight && 'motion-safe:transition-[height] motion-safe:duration-300 motion-safe:ease-out',
    viewportClass,
  )}
  {...viewportRest}
>
  <div
    data-slot="carousel-content"
    data-orientation={ctx.orientation}
    class={cn(
      'flex',
      ctx.orientation === 'horizontal'
        ? '-ms-4 touch-pan-y touch-pinch-zoom items-start'
        : '-mt-4 h-full touch-pan-x touch-pinch-zoom flex-col',
      className,
    )}
    {...rest}
  >
    {@render children?.()}
  </div>
</div>
