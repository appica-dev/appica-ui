<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { CarouselOrientation } from './carousel-types'

  export type CarouselProgressProps = HTMLAttributes<HTMLDivElement> & {
    /**
     * What drives the fill. `'auto'` counts down autoplay while it plays, otherwise tracks scroll position.
     * @default 'auto'
     */
    source?: 'auto' | 'autoplay' | 'scroll'
    /**
     * Straight bar or circular ring.
     * @default 'bar'
     */
    variant?: 'bar' | 'circular'
    /**
     * Fill direction for the bar variant.
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
  import CarouselAutoplayCircularIndicator from './carousel-autoplay-circular-indicator.svelte'
  import {
    CAROUSEL_PROGRESS_CIRCULAR_CIRCUMFERENCE,
    CAROUSEL_PROGRESS_CIRCULAR_RADIUS,
    CAROUSEL_PROGRESS_CIRCULAR_THICKNESS,
    CAROUSEL_PROGRESS_CIRCULAR_VIEWBOX,
  } from './carousel-tokens'

  let {
    class: className,
    source = 'auto',
    variant = 'bar',
    orientation = 'horizontal',
    light: lightProp,
    ...rest
  }: CarouselProgressProps = $props()

  const ctx = useCarousel()
  const light = $derived(lightProp ?? ctx.light)
  let scrollProgress = $state(0)

  $effect(() => {
    scrollProgress = ctx.getScrollProgress()
    return ctx.subscribeScrollProgress(() => {
      scrollProgress = ctx.getScrollProgress()
    })
  })

  const resolvedSource = $derived(
    source === 'auto' ? (ctx.autoplay && ctx.autoplay.isPlaying ? 'autoplay' : 'scroll') : source,
  )
  const showAutoplay = $derived(resolvedSource === 'autoplay' && ctx.autoplay !== null && !ctx.reducedMotion)
  const isHorizontal = $derived(orientation === 'horizontal')
  const center = CAROUSEL_PROGRESS_CIRCULAR_VIEWBOX / 2
  const offset = $derived(CAROUSEL_PROGRESS_CIRCULAR_CIRCUMFERENCE * (1 - scrollProgress))
</script>

{#if variant === 'circular'}
  <div
    data-slot="carousel-progress"
    data-variant="circular"
    data-source={resolvedSource}
    data-light={light || undefined}
    class={cn('relative size-10', className)}
    {...rest}
  >
    <svg
      aria-hidden="true"
      viewBox="0 0 {CAROUSEL_PROGRESS_CIRCULAR_VIEWBOX} {CAROUSEL_PROGRESS_CIRCULAR_VIEWBOX}"
      class="size-full -rotate-90 overflow-visible"
    >
      <circle
        data-slot="carousel-progress-track"
        cx={center}
        cy={center}
        r={CAROUSEL_PROGRESS_CIRCULAR_RADIUS}
        fill="none"
        stroke-width={CAROUSEL_PROGRESS_CIRCULAR_THICKNESS}
        class={light ? 'stroke-white/25' : 'stroke-border-strong'}
      />
      {#if showAutoplay && ctx.autoplay}
        {#key ctx.autoplay.cycleId}
          <CarouselAutoplayCircularIndicator
            delay={ctx.autoplay.delay}
            isPlaying={ctx.autoplay.isPlaying}
            {light}
            {center}
            radius={CAROUSEL_PROGRESS_CIRCULAR_RADIUS}
            circumference={CAROUSEL_PROGRESS_CIRCULAR_CIRCUMFERENCE}
            thickness={CAROUSEL_PROGRESS_CIRCULAR_THICKNESS}
          />
        {/key}
      {:else}
        <circle
          data-slot="carousel-progress-indicator"
          cx={center}
          cy={center}
          r={CAROUSEL_PROGRESS_CIRCULAR_RADIUS}
          fill="none"
          stroke-width={CAROUSEL_PROGRESS_CIRCULAR_THICKNESS}
          stroke-linecap="round"
          stroke-dasharray={CAROUSEL_PROGRESS_CIRCULAR_CIRCUMFERENCE}
          stroke-dashoffset={offset}
          class={light ? 'stroke-white' : 'stroke-primary'}
        />
      {/if}
    </svg>
  </div>
{:else}
  <div
    data-slot="carousel-progress"
    data-variant="bar"
    data-orientation={orientation}
    data-source={resolvedSource}
    data-light={light || undefined}
    class={cn(
      'relative overflow-hidden rounded-full',
      isHorizontal ? 'h-1.5 w-full' : 'h-full w-1.5',
      light ? 'bg-white/25' : 'bg-border-strong',
      className,
    )}
    {...rest}
  >
    {#if showAutoplay && ctx.autoplay}
      {#key ctx.autoplay.cycleId}
        <CarouselAutoplayIndicator
          delay={ctx.autoplay.delay}
          isPlaying={ctx.autoplay.isPlaying}
          {light}
          {orientation}
        />
      {/key}
    {:else}
      <span
        aria-hidden="true"
        data-slot="carousel-progress-indicator"
        data-orientation={orientation}
        class={cn('block rounded-full', isHorizontal ? 'h-full' : 'w-full', light ? 'bg-white' : 'bg-primary')}
        style:width={isHorizontal ? `${scrollProgress * 100}%` : undefined}
        style:height={isHorizontal ? undefined : `${scrollProgress * 100}%`}
      ></span>
    {/if}
  </div>
{/if}
