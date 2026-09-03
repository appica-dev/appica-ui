<script lang="ts">
  import { cn } from '../../internal/utils'

  let {
    delay,
    isPlaying,
    light,
    center,
    radius,
    circumference,
    thickness,
  }: {
    delay: number
    isPlaying: boolean
    light: boolean
    center: number
    radius: number
    circumference: number
    thickness: number
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

  const offset = $derived(armed && isPlaying ? 0 : circumference)
</script>

<circle
  data-slot="carousel-progress-indicator"
  data-playing={isPlaying || undefined}
  cx={center}
  cy={center}
  r={radius}
  fill="none"
  stroke-width={thickness}
  stroke-linecap="round"
  stroke-dasharray={circumference}
  stroke-dashoffset={offset}
  class={cn('motion-safe:transition-[stroke-dashoffset] motion-safe:ease-linear', light ? 'stroke-white' : 'stroke-primary')}
  style:transition-duration="{delay}ms"
/>
