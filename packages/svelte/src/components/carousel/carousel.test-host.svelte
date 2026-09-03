<script lang="ts">
  import type { CarouselApi, CarouselNavPosition, CarouselOrientation } from './carousel-types'
  import Carousel from './carousel.svelte'
  import CarouselApiReader from './carousel.test-api-reader.svelte'
  import CarouselContent from './carousel-content.svelte'
  import CarouselNext from './carousel-next.svelte'
  import CarouselPagination from './carousel-pagination.svelte'
  import CarouselPrev from './carousel-prev.svelte'
  import CarouselProgress from './carousel-progress.svelte'
  import CarouselSlide from './carousel-slide.svelte'
  import CarouselThumb from './carousel-thumb.svelte'
  import CarouselThumbs from './carousel-thumbs.svelte'

  let {
    orientation,
    class: className,
    contentClass,
    slideClass,
    paginationClass,
    paginationLight = false,
    prevClass,
    prevPosition,
    nextPosition,
    nextDisabled,
    nextOnclick,
    showPagination = true,
    showProgress = false,
    showThumbs = false,
    thumbsOrientation,
    thumbsLight,
    thumbIndex,
    thumbOnclick,
    autoplay,
    onReInit,
    setApi,
    onApi,
    'aria-label': ariaLabel,
  }: {
    orientation?: CarouselOrientation
    class?: string
    contentClass?: string
    slideClass?: string
    paginationClass?: string
    paginationLight?: boolean
    prevClass?: string
    prevPosition?: CarouselNavPosition
    nextPosition?: CarouselNavPosition
    nextDisabled?: boolean
    nextOnclick?: () => void
    showPagination?: boolean
    showProgress?: boolean
    showThumbs?: boolean
    thumbsOrientation?: CarouselOrientation
    thumbsLight?: boolean
    thumbIndex?: number
    thumbOnclick?: () => void
    autoplay?: boolean | { delay: number }
    onReInit?: (api: CarouselApi) => void
    setApi?: (api: CarouselApi) => void
    onApi?: (api: CarouselApi | undefined) => void
    'aria-label'?: string
  } = $props()

  const labelSpread = $derived(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })
</script>

<Carousel {orientation} class={className} {autoplay} {onReInit} {setApi} {...labelSpread}>
  {#if onApi}
    <CarouselApiReader {onApi} />
  {/if}
  <CarouselContent class={contentClass}>
    <CarouselSlide class={slideClass}>Slide 1</CarouselSlide>
    <CarouselSlide>Slide 2</CarouselSlide>
    <CarouselSlide>Slide 3</CarouselSlide>
    <CarouselSlide>Slide 4</CarouselSlide>
  </CarouselContent>
  <CarouselPrev class={prevClass} position={prevPosition} />
  <CarouselNext position={nextPosition} disabled={nextDisabled} onclick={nextOnclick} />
  {#if showPagination}
    <CarouselPagination class={paginationClass} light={paginationLight} />
  {/if}
  {#if showProgress}
    <CarouselProgress />
  {/if}
  {#if showThumbs}
    <CarouselThumbs orientation={thumbsOrientation} light={thumbsLight}>
      {#if thumbIndex !== undefined}
        <CarouselThumb index={thumbIndex} onclick={thumbOnclick}>Five</CarouselThumb>
      {:else}
        <CarouselThumb onclick={thumbOnclick}>
          <img src="/1.jpg" alt="" />
        </CarouselThumb>
        <CarouselThumb>
          <img src="/2.jpg" alt="" />
        </CarouselThumb>
        <CarouselThumb>
          <img src="/3.jpg" alt="" />
        </CarouselThumb>
      {/if}
    </CarouselThumbs>
  {/if}
</Carousel>
