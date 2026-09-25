<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@appica/icons-svelte'
  import {
    Carousel,
    CarouselContent,
    CarouselNext,
    CarouselPrev,
    CarouselSlide,
    buttonVariants,
    type CarouselApi,
  } from '@appica/ui-svelte'

  const SLIDES = [1, 2, 3, 4, 5, 6]
  const PARALLAX_FACTOR = 1.7
  const SLIDE_SRC = (n: number) => `https://appica.dev/carousel/slide-${n}.jpg`
  const navSquare = buttonVariants({ variant: 'outline', size: 'icon-md' })

  let api = $state.raw<CarouselApi | undefined>(undefined)

  $effect(() => {
    const carouselApi = api
    if (!carouselApi) return
    const layers = carouselApi.slideNodes().map((slide) => slide.querySelector<HTMLElement>('[data-parallax-layer]'))

    const tween = (_api: CarouselApi, event?: { type: string }) => {
      const engine = carouselApi.internalEngine()
      const scrollProgress = carouselApi.scrollProgress()
      const slidesInView = carouselApi.slidesInView()
      const isScroll = event?.type === 'scroll'

      carouselApi.snapList().forEach((snap, snapIndex) => {
        let diffToTarget = snap - scrollProgress
        const slidesInSnap = engine.scrollSnapList.slidesBySnap[snapIndex] ?? []

        slidesInSnap.forEach((slideIndex) => {
          if (isScroll && !slidesInView.includes(slideIndex)) return
          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem: { target: () => number; index: number }) => {
              const target = loopItem.target()
              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target)
                if (sign === -1) diffToTarget = snap - (1 + scrollProgress)
                if (sign === 1) diffToTarget = snap + (1 - scrollProgress)
              }
            })
          }
          const translate = diffToTarget * (-1 * PARALLAX_FACTOR) * 100
          const layer = layers[slideIndex]
          if (layer) layer.style.transform = `translateX(${translate}%)`
        })
      })
    }

    tween(carouselApi)
    carouselApi.on('scroll', tween)
    carouselApi.on('slidefocus', tween)
    carouselApi.on('reinit', tween)
    return () => {
      carouselApi.off('scroll', tween)
      carouselApi.off('slidefocus', tween)
      carouselApi.off('reinit', tween)
    }
  })
</script>

{#snippet chevronLeft()}
  <ChevronLeft class="rtl:rotate-180" />
{/snippet}

{#snippet chevronRight()}
  <ChevronRight class="rtl:rotate-180" />
{/snippet}

<div class="w-full max-w-xl">
  <Carousel
    loop
    align="center"
    setApi={(next) => {
      api = next
    }}
  >
    <CarouselContent>
      {#each SLIDES as n (n)}
        <CarouselSlide class="basis-2/3">
          <div class="aspect-3/2 overflow-hidden rounded-xl">
            <div data-parallax-layer class="size-full">
              <img src={SLIDE_SRC(n)} alt="Slide {n}" class="size-full scale-[1.6] object-cover" />
            </div>
          </div>
        </CarouselSlide>
      {/each}
    </CarouselContent>
    <div class="mt-5 flex justify-center gap-2">
      <CarouselPrev position="none" buttonProps={{ class: navSquare }}>{@render chevronLeft()}</CarouselPrev>
      <CarouselNext position="none" buttonProps={{ class: navSquare }}>{@render chevronRight()}</CarouselNext>
    </div>
  </Carousel>
</div>
