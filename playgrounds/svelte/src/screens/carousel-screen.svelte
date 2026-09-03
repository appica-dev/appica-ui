<script lang="ts">
  import {
    Carousel,
    CarouselContent,
    CarouselNext,
    CarouselPagination,
    CarouselPrev,
    CarouselProgress,
    CarouselSlide,
    CarouselThumb,
    CarouselThumbs,
  } from '@appica/ui-svelte'

  const slides = ['Alpine lake', 'Cedar trail', 'Night market', 'Harbor dawn']
  const navButton =
    '[&_button]:bg-background [&_button]:text-foreground-emphasis [&_button]:inline-flex [&_button]:size-8 [&_button]:items-center [&_button]:justify-center [&_button]:rounded-sm [&_button]:border [&_button]:border-border [&_button]:shadow-sm hover:[&_button]:bg-background-subtle'
</script>

{#snippet chevron(flip: boolean)}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class={['size-4', flip && 'rotate-180']}>
    <path
      d="M9.594 3.594c.225-.225.588-.225.812 0s.225.588 0 .812L6.812 8l3.594 3.594c.225.225.225.588 0 .813s-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812l4-4z"
    />
  </svg>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Carousel</h2>

  <div class="flex max-w-lg flex-col gap-2">
    <p class="text-foreground-muted text-sm">Controls and pagination</p>
    <Carousel loop>
      <CarouselContent>
        {#each slides as slide (slide)}
          <CarouselSlide>
            <div class="bg-background-muted text-foreground-emphasis flex h-48 items-center justify-center rounded-xl text-lg font-medium">
              {slide}
            </div>
          </CarouselSlide>
        {/each}
      </CarouselContent>
      <CarouselPrev class={navButton}>{@render chevron(false)}</CarouselPrev>
      <CarouselNext class={navButton}>{@render chevron(true)}</CarouselNext>
      <CarouselPagination class="mt-4 justify-center" />
    </Carousel>
  </div>

  <div class="flex max-w-lg flex-col gap-2">
    <p class="text-foreground-muted text-sm">Thumbnails</p>
    <Carousel>
      <CarouselContent>
        {#each slides as slide (slide)}
          <CarouselSlide>
            <div class="bg-background-muted text-foreground-emphasis flex h-40 items-center justify-center rounded-xl font-medium">
              {slide}
            </div>
          </CarouselSlide>
        {/each}
      </CarouselContent>
      <CarouselThumbs class="mt-3">
        {#each slides as slide, index (slide)}
          <CarouselThumb>
            <span class="flex size-full items-center justify-center text-xs">{index + 1}</span>
          </CarouselThumb>
        {/each}
      </CarouselThumbs>
    </Carousel>
  </div>

  <div class="flex max-w-lg flex-col gap-2">
    <p class="text-foreground-muted text-sm">Scroll progress</p>
    <Carousel>
      <CarouselContent>
        {#each slides as slide (slide)}
          <CarouselSlide>
            <div class="bg-background-muted flex h-32 items-center justify-center rounded-xl">{slide}</div>
          </CarouselSlide>
        {/each}
      </CarouselContent>
      <CarouselProgress class="mt-4" source="scroll" />
    </Carousel>
  </div>
</section>
