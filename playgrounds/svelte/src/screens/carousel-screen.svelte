<script lang="ts">
  import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from '@appica/icons-svelte'
  import {
    Button,
    Carousel,
    CarouselContent,
    CarouselNext,
    CarouselPagination,
    CarouselPrev,
    CarouselProgress,
    CarouselSlide,
    CarouselThumb,
    CarouselThumbs,
    buttonVariants,
    useLinkedCarousels,
    type CarouselApi,
    type CarouselNavPosition,
  } from '@appica/ui-svelte'
  import CarouselParallaxExample from './carousel-parallax-example.svelte'
  import CarouselScaleExample from './carousel-scale-example.svelte'

  const SLIDE_SRC = (n: number) => `https://appica.dev/carousel/slide-${n}.jpg`

  const DEFAULT_SLIDES = [1, 2, 3, 4, 5]
  const MULTIPLE_SLIDES = [4, 5, 6, 7, 8, 2]
  const ALIGNMENT_SLIDES = [1, 2, 3, 4, 5, 6]
  const VERTICAL_SLIDES = [1, 2, 4, 5]
  const AUTOPLAY_SLIDES = [1, 5, 4, 7, 6]
  const STRIP_SLIDES = [1, 2, 3, 4, 5, 6, 7, 8]
  const PROGRESS_SLIDES = [1, 2, 3, 4, 5, 6]
  const THUMB_SLIDES = [1, 2, 3, 4, 5, 6, 7]
  const AUTOPLAY = { delay: 4000, resumeAfter: 3000 }
  const AUTO_SCROLL = { speed: 1.5, startDelay: 0, resumeAfter: 3000 }
  const AUTOPLAY_CARDS = [
    { title: 'Short', body: 'A compact slide.' },
    {
      title: 'Medium',
      body: 'This slide carries a couple of sentences, so it stands a little taller than the first. The viewport grows to fit it.',
    },
    {
      title: 'Tall',
      body: "And this one runs longer still. Auto Height animates the viewport between each slide's natural height as you navigate, so nothing is clipped and there's no empty space below shorter slides. It keeps mixed-length content - quotes, cards, forms - looking tidy inside a single carousel.",
    },
  ]
  const SYNCED_SLIDES = [
    {
      n: 1,
      title: 'Sunlit summit',
      body: 'First light catches the ridgeline while the valley below stays in shadow - the clearest window for the summit push.',
    },
    {
      n: 2,
      title: 'Deer in bloom',
      body: 'A herd grazes the high meadow at golden hour, wildflowers running all the way to the treeline.',
    },
    {
      n: 3,
      title: 'Turquoise cove',
      body: 'Sea stacks shelter a quiet lagoon where the water shifts from pale sand to deep aquamarine.',
    },
    {
      n: 4,
      title: 'Rose plains',
      body: 'An abandoned homestead sits alone in a sea of pink grass, wide sky stretching to the horizon.',
    },
    {
      n: 5,
      title: 'Mirror lake',
      body: 'A lone peak doubles in glassy water as birds drift across a calm afternoon sky.',
    },
  ]
  const OVERLAY_SLIDES = [
    { n: 1, title: 'Sunlit summit', caption: 'Aurora Range' },
    { n: 2, title: 'Deer in bloom', caption: 'Meadowvale Alps' },
    { n: 3, title: 'Turquoise cove', caption: 'Azure Isles' },
    { n: 4, title: 'Rose plains', caption: 'Crimson Flats' },
    { n: 5, title: 'Mirror lake', caption: 'Stillwater Valley' },
  ]

  const navRound = `${buttonVariants({ variant: 'outline', size: 'icon-md' })} rounded-full`
  const navRoundLight = `${buttonVariants({ variant: 'light', size: 'icon-md' })} rounded-full`
  const navSquare = buttonVariants({ variant: 'outline', size: 'icon-md' })

  let imagesApi = $state.raw<CarouselApi | undefined>(undefined)
  let textApi = $state.raw<CarouselApi | undefined>(undefined)
  let controlledApi = $state.raw<CarouselApi | undefined>(undefined)
  let current = $state(0)
  let count = $state(0)

  useLinkedCarousels(
    () => imagesApi,
    () => textApi,
  )

  $effect(() => {
    const api = controlledApi
    if (!api) return
    count = api.snapList().length
    current = api.selectedSnap()
    const onSelect = () => {
      current = api.selectedSnap()
    }
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  })
</script>

{#snippet chevronLeft()}
  <ChevronLeft class="rtl:rotate-180" />
{/snippet}

{#snippet chevronRight()}
  <ChevronRight class="rtl:rotate-180" />
{/snippet}

{#snippet chevronUp()}
  <ChevronUp />
{/snippet}

{#snippet chevronDown()}
  <ChevronDown />
{/snippet}

{#snippet roundArrows(position: CarouselNavPosition = 'inside')}
  <CarouselPrev {position} buttonProps={{ class: navRound }}>{@render chevronLeft()}</CarouselPrev>
  <CarouselNext {position} buttonProps={{ class: navRound }}>{@render chevronRight()}</CarouselNext>
{/snippet}

{#snippet squareArrows()}
  <CarouselPrev position="none" buttonProps={{ class: navSquare }}>{@render chevronLeft()}</CarouselPrev>
  <CarouselNext position="none" buttonProps={{ class: navSquare }}>{@render chevronRight()}</CarouselNext>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Carousel</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Default</p>
    <div class="w-full max-w-xl pb-8">
      <Carousel loop>
        <CarouselContent>
          {#each DEFAULT_SLIDES as n (n)}
            <CarouselSlide>
              <img
                src={SLIDE_SRC(n)}
                alt="Slide {n}"
                class="aspect-3/2 w-full rounded-xl object-cover"
              />
            </CarouselSlide>
          {/each}
        </CarouselContent>
        {@render roundArrows()}
        <CarouselPagination class="absolute inset-x-0 top-full mt-5 justify-center" />
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Multiple slides (responsive)</p>
    <div class="w-full max-w-xl px-15">
      <Carousel align="start" slidesToScroll="auto" loop>
        <CarouselContent>
          {#each MULTIPLE_SLIDES as n (n)}
            <CarouselSlide class="sm:basis-1/2 md:basis-1/3">
              <img src={SLIDE_SRC(n)} alt="Slide {n}" class="aspect-square w-full rounded-xl object-cover" />
            </CarouselSlide>
          {/each}
        </CarouselContent>
        {@render roundArrows('outside')}
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Alignment</p>
    <div class="w-full max-w-xl">
      <Carousel align="center" loop>
        <CarouselContent>
          {#each ALIGNMENT_SLIDES as n (n)}
            <CarouselSlide class="basis-2/3">
              <img
                src={SLIDE_SRC(n)}
                alt="Slide {n}"
                class="aspect-3/2 w-full rounded-xl object-cover"
              />
            </CarouselSlide>
          {/each}
        </CarouselContent>
        {@render roundArrows()}
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Vertical</p>
    <div class="w-full">
      <Carousel orientation="vertical" loop class="flex w-full items-center justify-center gap-5">
        <div class="relative w-full max-w-xl">
          <CarouselContent class="h-100">
            {#each VERTICAL_SLIDES as n (n)}
              <CarouselSlide>
                <img src={SLIDE_SRC(n)} alt="Slide {n}" class="size-full rounded-xl object-cover" />
              </CarouselSlide>
            {/each}
          </CarouselContent>
          <CarouselPrev buttonProps={{ class: navRound }}>{@render chevronUp()}</CarouselPrev>
          <CarouselNext buttonProps={{ class: navRound }}>{@render chevronDown()}</CarouselNext>
        </div>
        <CarouselPagination orientation="vertical" />
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Autoplay</p>
    <div class="w-full max-w-xl pb-8">
      <Carousel loop autoplay={AUTOPLAY}>
        <CarouselContent>
          {#each AUTOPLAY_SLIDES as n (n)}
            <CarouselSlide>
              <img
                src={SLIDE_SRC(n)}
                alt="Slide {n}"
                class="aspect-3/2 w-full rounded-xl object-cover"
              />
            </CarouselSlide>
          {/each}
        </CarouselContent>
        <CarouselPagination class="absolute inset-x-0 top-full mt-5 justify-center" />
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Auto Scroll</p>
    <div class="w-full max-w-xl">
      <Carousel loop dragFree autoScroll={AUTO_SCROLL}>
        <CarouselContent>
          {#each STRIP_SLIDES as n (n)}
            <CarouselSlide class="basis-1/2 sm:basis-1/3">
              <img src={SLIDE_SRC(n)} alt="Slide {n}" class="aspect-square w-full rounded-xl object-cover" />
            </CarouselSlide>
          {/each}
        </CarouselContent>
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Fade</p>
    <div class="w-full max-w-xl pb-8">
      <Carousel loop fade>
        <CarouselContent>
          {#each DEFAULT_SLIDES as n (n)}
            <CarouselSlide>
              <img
                src={SLIDE_SRC(n)}
                alt="Slide {n}"
                class="aspect-3/2 w-full rounded-xl object-cover"
              />
            </CarouselSlide>
          {/each}
        </CarouselContent>
        {@render roundArrows()}
        <CarouselPagination class="absolute inset-x-0 top-full mt-5 justify-center" />
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Auto Height</p>
    <div class="w-full max-w-md">
      <Carousel loop autoHeight align="start">
        <CarouselContent>
          {#each AUTOPLAY_CARDS as card (card.title)}
            <CarouselSlide>
              <div class="border-border-muted bg-background-subtle rounded-xl border p-6">
                <h4 class="text-foreground-intense mb-2 font-semibold">{card.title}</h4>
                <p class="text-sm">{card.body}</p>
              </div>
            </CarouselSlide>
          {/each}
        </CarouselContent>
        <div class="mt-5 flex items-center justify-between gap-4">
          <CarouselPrev position="none" buttonProps={{ class: navSquare }}>{@render chevronLeft()}</CarouselPrev>
          <CarouselPagination />
          <CarouselNext position="none" buttonProps={{ class: navSquare }}>{@render chevronRight()}</CarouselNext>
        </div>
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Free drag and wheel gestures</p>
    <div class="w-full max-w-xl">
      <Carousel dragFree wheelGestures align="start" containScroll="trimSnaps">
        <CarouselContent>
          {#each STRIP_SLIDES as n (n)}
            <CarouselSlide class="basis-1/2 sm:basis-1/3 md:basis-1/4">
              <img src={SLIDE_SRC(n)} alt="Slide {n}" class="aspect-square w-full rounded-xl object-cover" />
            </CarouselSlide>
          {/each}
        </CarouselContent>
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Progress</p>
    <div class="w-full max-w-xl">
      <Carousel align="start">
        <CarouselContent>
          {#each PROGRESS_SLIDES as n (n)}
            <CarouselSlide class="basis-1/2 sm:basis-1/3">
              <img src={SLIDE_SRC(n)} alt="Slide {n}" class="aspect-square w-full rounded-xl object-cover" />
            </CarouselSlide>
          {/each}
        </CarouselContent>
        <div class="mt-5 flex items-center justify-between">
          <CarouselProgress class="w-14" />
          <div class="flex gap-2">
            {@render squareArrows()}
          </div>
        </div>
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Thumbnails</p>
    <Carousel loop class="flex w-full max-w-142 flex-col gap-3">
      <CarouselContent>
        {#each THUMB_SLIDES as n (n)}
          <CarouselSlide>
            <img src={SLIDE_SRC(n)} alt="Slide {n}" class="aspect-3/2 w-full rounded-xl object-cover" />
          </CarouselSlide>
        {/each}
      </CarouselContent>
      <CarouselThumbs>
        {#each THUMB_SLIDES as n (n)}
          <CarouselThumb class="w-16 sm:w-22">
            <img src={SLIDE_SRC(n)} alt="" class="size-full object-cover" />
          </CarouselThumb>
        {/each}
      </CarouselThumbs>
    </Carousel>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Thumbnails over imagery</p>
    <Carousel loop class="w-full max-w-146 overflow-hidden rounded-xl">
      <CarouselContent>
        {#each THUMB_SLIDES as n (n)}
          <CarouselSlide>
            <div class="relative aspect-3/2 w-full">
              <img src={SLIDE_SRC(n)} alt="Slide {n}" class="size-full object-cover" />
              <div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"></div>
            </div>
          </CarouselSlide>
        {/each}
      </CarouselContent>
      <CarouselThumbs light class="absolute inset-x-0 bottom-3 px-3 sm:bottom-4 sm:px-4">
        {#each THUMB_SLIDES as n (n)}
          <CarouselThumb class="w-14 sm:w-18">
            <img src={SLIDE_SRC(n)} alt="" class="size-full object-cover" />
          </CarouselThumb>
        {/each}
      </CarouselThumbs>
    </Carousel>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Synced carousels</p>
    <div class="flex w-full max-w-xl flex-col gap-4 px-15">
      <Carousel
        loop
        setApi={(api) => {
          imagesApi = api
        }}
      >
        <CarouselContent>
          {#each SYNCED_SLIDES as slide (slide.n)}
            <CarouselSlide>
              <img
                src={SLIDE_SRC(slide.n)}
                alt={slide.title}
                class="aspect-3/2 w-full rounded-xl object-cover"
              />
            </CarouselSlide>
          {/each}
        </CarouselContent>
        {@render roundArrows('outside')}
      </Carousel>
      <Carousel
        loop
        fade
        draggable={false}
        setApi={(api) => {
          textApi = api
        }}
      >
        <CarouselContent>
          {#each SYNCED_SLIDES as slide (slide.n)}
            <CarouselSlide>
              <div class="min-h-24 text-center">
                <p class="text-foreground-intense text-lg font-semibold">{slide.title}</p>
                <p class="text-foreground mt-1 text-sm">{slide.body}</p>
              </div>
            </CarouselSlide>
          {/each}
        </CarouselContent>
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Parallax</p>
    <CarouselParallaxExample />
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Scale</p>
    <CarouselScaleExample />
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Overlaid controls</p>
    <div class="w-full max-w-xl">
      <Carousel loop class="overflow-hidden rounded-xl">
        <CarouselContent>
          {#each OVERLAY_SLIDES as slide (slide.n)}
            <CarouselSlide>
              <div class="relative aspect-3/2 w-full">
                <img src={SLIDE_SRC(slide.n)} alt={slide.title} class="size-full object-cover" />
                <div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent"></div>
                <div class="absolute inset-s-0 bottom-0 p-5">
                  <p class="text-lg font-semibold text-white">{slide.title}</p>
                  <p class="text-sm text-white/70">{slide.caption}</p>
                </div>
              </div>
            </CarouselSlide>
          {/each}
        </CarouselContent>
        <CarouselPrev buttonProps={{ class: navRoundLight }}>{@render chevronLeft()}</CarouselPrev>
        <CarouselNext buttonProps={{ class: navRoundLight }}>{@render chevronRight()}</CarouselNext>
        <CarouselPagination light class="absolute inset-x-0 bottom-5 justify-center" />
      </Carousel>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Controlled with the api</p>
    <div class="w-full max-w-xl">
      <Carousel
        loop
        setApi={(api) => {
          controlledApi = api
        }}
      >
        <CarouselContent>
          {#each DEFAULT_SLIDES as n (n)}
            <CarouselSlide>
              <img
                src={SLIDE_SRC(n)}
                alt="Slide {n}"
                class="aspect-3/2 w-full rounded-xl object-cover"
              />
            </CarouselSlide>
          {/each}
        </CarouselContent>
      </Carousel>
      <div class="mt-5 flex items-center justify-between">
        <Button variant="outline" size="icon-md" aria-label="Previous slide" onclick={() => controlledApi?.goToPrev()}>
          {@render chevronLeft()}
        </Button>
        <p class="text-sm tabular-nums">
          Slide {current + 1} of {count}
        </p>
        <Button variant="outline" size="icon-md" aria-label="Next slide" onclick={() => controlledApi?.goToNext()}>
          {@render chevronRight()}
        </Button>
      </div>
    </div>
  </div>
</section>
