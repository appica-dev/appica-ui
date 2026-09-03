<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { CarouselOrientation } from './carousel-types'

  export type CarouselPaginationProps = HTMLAttributes<HTMLDivElement> & {
    /**
     * Lay the bullets out in a row or a column.
     * @default 'horizontal'
     */
    orientation?: CarouselOrientation
    /**
     * Light-on-dark styling for use over imagery.
     * @default false
     */
    light?: boolean
  }
</script>

<script lang="ts">
  import { cn } from '../../internal/utils'
  import { useCarousel } from './carousel-context'
  import CarouselAutoplayIndicator from './carousel-autoplay-indicator.svelte'

  let { class: className, orientation = 'horizontal', light: lightProp, ...rest }: CarouselPaginationProps = $props()

  const ctx = useCarousel()
  const light = $derived(lightProp ?? ctx.light)
  const isHorizontal = $derived(orientation === 'horizontal')
</script>

{#if ctx.scrollSnaps.length > 1}
  <div
    data-slot="carousel-pagination"
    data-orientation={orientation}
    role="group"
    aria-label="Choose slide to display"
    class={cn('flex gap-2 data-[orientation=vertical]:flex-col', className)}
    {...rest}
  >
    {#each ctx.scrollSnaps as _snap, index (index)}
      {@const isActive = index === ctx.selectedIndex}
      {@const renderAutoplay = isActive && ctx.autoplay !== null && ctx.autoplay.isPlaying && !ctx.reducedMotion}
      <button
        type="button"
        aria-current={isActive ? 'true' : undefined}
        aria-label={`Go to slide ${index + 1}`}
        data-slot="carousel-pagination-bullet"
        data-orientation={orientation}
        data-active={isActive || undefined}
        data-autoplay={renderAutoplay || undefined}
        onclick={() => ctx.scrollTo(index)}
        class={cn(
          'cursor-pointer rounded-full outline-offset-1',
          isHorizontal ? 'h-1.5' : 'w-1.5',
          light ? 'outline-ring-light' : 'outline-ring',
          'motion-safe:transition-[width,height,background-color] motion-safe:duration-300',
          !isActive && (light ? 'bg-white/25' : 'bg-border-strong'),
          !isActive && (isHorizontal ? 'w-1.5' : 'h-1.5'),
          isActive && !renderAutoplay && (light ? 'bg-white' : 'bg-primary'),
          isActive && !renderAutoplay && (isHorizontal ? 'w-5' : 'h-5'),
          renderAutoplay && 'relative overflow-hidden',
          renderAutoplay && (light ? 'bg-white/25' : 'bg-border-strong'),
          renderAutoplay && (isHorizontal ? 'w-10' : 'h-10'),
        )}
      >
        {#if renderAutoplay && ctx.autoplay}
          {#key ctx.autoplay.cycleId}
            <CarouselAutoplayIndicator
              delay={ctx.autoplay.delay}
              isPlaying={ctx.autoplay.isPlaying}
              {light}
              {orientation}
            />
          {/key}
        {/if}
      </button>
    {/each}
  </div>
{/if}
