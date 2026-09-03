<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import type { CarouselOrientation } from './carousel-types'

  export type CarouselThumbsProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    /**
     * Lay the thumbnails out in a row or a column. Independent of the carousel's own axis.
     * @default 'horizontal'
     */
    orientation?: CarouselOrientation
    /**
     * Light-on-dark styling for use over imagery.
     * @default false
     */
    light?: boolean
    children?: Snippet
  }
</script>

<script lang="ts">
  import { asBitsAttrs, cn } from '../../internal/utils'
  import Carousel from './carousel.svelte'
  import CarouselContent from './carousel-content.svelte'
  import { useCarousel } from './carousel-context'
  import { setCarouselThumbsContext } from './carousel-thumbs-context'
  import { CAROUSEL_THUMB_OPTIONS } from './carousel-tokens'
  import { sameThumbBox, type CarouselApi, type CarouselThumbBox } from './carousel-types'

  let {
    class: className,
    orientation = 'horizontal',
    light: lightProp,
    children,
    ...rest
  }: CarouselThumbsProps = $props()

  const parent = useCarousel()
  const light = $derived(lightProp ?? parent.light)
  const vertical = $derived(orientation === 'vertical')

  let thumbsApi = $state<CarouselApi | undefined>(undefined)
  let box = $state<CarouselThumbBox | null>(null)
  let thumbCount = 0

  setCarouselThumbsContext({
    get selectedIndex() {
      return parent.selectedIndex
    },
    select(index) {
      parent.scrollTo(index)
    },
    get light() {
      return light
    },
    nextIndex() {
      const next = thumbCount
      thumbCount += 1
      return next
    },
  })

  $effect(() => {
    const api = thumbsApi
    const selected = parent.selectedIndex

    const measure = () => {
      const thumb = api?.slideNodes()[selected]
      const track = api?.containerNode()
      if (!thumb || !track) {
        box = null
        return
      }
      const nested = thumb.offsetParent === track
      const next = {
        x: thumb.offsetLeft - (nested ? 0 : track.offsetLeft),
        y: thumb.offsetTop - (nested ? 0 : track.offsetTop),
        width: thumb.offsetWidth,
        height: thumb.offsetHeight,
      }
      box = sameThumbBox(box, next) ? box : next
    }

    measure()
    if (!api) return

    api.on('reinit', measure)
    api.on('slideschanged', measure)
    api.on('select', measure)

    const thumb = api.slideNodes()[selected]
    const track = api.containerNode()
    let observer: ResizeObserver | undefined
    if (thumb && track && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure)
      observer.observe(thumb)
    }
    return () => {
      api.off('reinit', measure)
      api.off('slideschanged', measure)
      api.off('select', measure)
      observer?.disconnect()
    }
  })

  $effect(() => {
    const api = thumbsApi
    const selected = parent.selectedIndex
    const isVertical = vertical
    const thumb = api?.slideNodes()[selected]
    const viewport = api?.rootNode()
    if (!thumb || !viewport) return
    const slide = thumb.getBoundingClientRect()
    const frame = viewport.getBoundingClientRect()
    const visible = isVertical
      ? slide.top >= frame.top - 1 && slide.bottom <= frame.bottom + 1
      : slide.left >= frame.left - 1 && slide.right <= frame.right + 1
    if (!visible) api?.goTo(selected)
  })
</script>

<Carousel
  {orientation}
  align="start"
  containScroll="keepSnaps"
  options={CAROUSEL_THUMB_OPTIONS}
  setApi={(api) => {
    thumbsApi = api
  }}
  light={light}
  role="group"
  aria-roledescription={undefined}
  aria-label="Choose slide to display"
  data-slot="carousel-thumbs"
  class={cn(vertical ? 'shrink-0' : 'w-full', className)}
  {...asBitsAttrs(rest)}
>
  <CarouselContent
    viewportProps={{
      class: cn('-m-0.5 p-0.5', vertical && 'h-[calc(100%+(--spacing(1)))]'),
    }}
    class={cn('gap-2', vertical ? 'mt-0' : 'ms-0')}
  >
    {@render children?.()}
    {#if box}
      <span
        aria-hidden="true"
        data-slot="carousel-thumbs-indicator"
        class={cn(
          'pointer-events-none absolute top-0 left-0 rounded-lg border',
          light ? 'border-white' : 'border-border-inverse',
          'motion-safe:transition-[translate,width,height] motion-safe:duration-250',
        )}
        style:translate="{box.x}px {box.y}px"
        style:width="{box.width}px"
        style:height="{box.height}px"
      ></span>
    {/if}
  </CarouselContent>
</Carousel>
