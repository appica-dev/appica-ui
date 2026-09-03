<script lang="ts">
  import { cn } from '../../internal/utils'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { patternSpotlight, type BackgroundPatternVariant } from './background-pattern-shared'
  import BackgroundPatternLayer from './background-pattern-layer.svelte'

  type Props = {
    variant: BackgroundPatternVariant
    persistent?: boolean
    track?: 'self' | 'window'
  }

  let { variant, persistent: persistentProp = false, track = 'self' }: Props = $props()

  const reducedMotion = useReducedMotion()
  const persistent = $derived(persistentProp || reducedMotion.current)

  const SPOTLIGHT =
    'radial-gradient(circle var(--pattern-highlight) at var(--pattern-x, 50%) var(--pattern-y, 50%), #000 0%, #000 5%, 35%, transparent 100%)'
  const FADE_DURATION = 1200

  const spotlightAttach = $derived.by(() => {
    const isPersistent = persistent
    const trackMode = track
    return (node: HTMLElement) => {
      const host = node.parentElement
      if (!host) return

      const target: EventTarget = trackMode === 'window' ? window : host

      let frame = 0
      let clientX = 0
      let clientY = 0

      const flush = () => {
        frame = 0
        const rect = host.getBoundingClientRect()
        node.style.setProperty('--pattern-x', `${clientX - rect.left}px`)
        node.style.setProperty('--pattern-y', `${clientY - rect.top}px`)
      }

      const fade =
        !isPersistent && typeof node.animate === 'function'
          ? node.animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: FADE_DURATION,
              easing: 'ease-out',
              fill: 'forwards',
            })
          : null
      fade?.finish?.()

      const handleMove = (event: Event) => {
        const pointer = event as PointerEvent
        clientX = pointer.clientX
        clientY = pointer.clientY
        if (!frame) frame = requestAnimationFrame(flush)
        if (fade) {
          if ('currentTime' in fade) fade.currentTime = 0
          fade.play?.()
        }
      }

      target.addEventListener('pointermove', handleMove, { passive: true })

      return () => {
        if (frame) cancelAnimationFrame(frame)
        fade?.cancel?.()
        target.removeEventListener('pointermove', handleMove)
      }
    }
  })
</script>

<div
  aria-hidden="true"
  data-slot="background-pattern-highlight"
  data-persistent={persistent ? '' : undefined}
  class={cn(
    'pointer-events-none absolute inset-0 -z-10 text-(--pattern-color)',
    persistent ? 'opacity-100' : 'opacity-0',
  )}
  style={`-webkit-mask-image: ${SPOTLIGHT}; mask-image: ${SPOTLIGHT}`}
  {@attach spotlightAttach}
>
  <BackgroundPatternLayer {variant} class={patternSpotlight(variant)} />
</div>
