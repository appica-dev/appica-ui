<script lang="ts">
  import { cn } from '../../internal/utils'
  import type { CarouselOrientation } from './carousel-types'

  let {
    delay,
    isPlaying,
    light,
    orientation,
  }: {
    delay: number
    isPlaying: boolean
    light: boolean
    orientation: CarouselOrientation
  } = $props()

  let armed = $state(false)

  $effect(() => {
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        armed = true
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  })

  const isHorizontal = $derived(orientation === 'horizontal')
  const fillValue = $derived(armed && isPlaying ? '100%' : '0%')
</script>

<span
  aria-hidden="true"
  data-slot="carousel-pagination-indicator"
  data-orientation={orientation}
  data-playing={isPlaying || undefined}
  class={cn(
    'absolute rounded-full',
    isHorizontal ? 'inset-y-0 inset-s-0' : 'inset-x-0 top-0',
    isHorizontal ? 'motion-safe:transition-[width]' : 'motion-safe:transition-[height]',
    'motion-safe:ease-linear',
    light ? 'bg-white' : 'bg-primary',
  )}
  style:transition-duration="{delay}ms"
  style:width={isHorizontal ? fillValue : undefined}
  style:height={isHorizontal ? undefined : fillValue}
></span>
