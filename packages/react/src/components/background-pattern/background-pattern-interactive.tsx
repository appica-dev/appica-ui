'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { PatternLayer, patternSpotlight, type BackgroundPatternVariant } from './background-pattern-shared'

interface BackgroundPatternInteractiveProps {
  variant: BackgroundPatternVariant
  cell: number
  persistent?: boolean
  track?: 'self' | 'window'
}

const SPOTLIGHT =
  'radial-gradient(circle var(--pattern-highlight) at var(--pattern-x, 50%) var(--pattern-y, 50%), #000 0%, #000 5%, 35%, transparent 100%)'

const FADE_DURATION = 1200

function BackgroundPatternInteractive({
  variant,
  cell,
  persistent: persistentProp = false,
  track = 'self',
}: BackgroundPatternInteractiveProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const reducedMotion = useReducedMotion()
  const persistent = persistentProp || reducedMotion

  React.useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!el || !host) return

    const target: EventTarget = track === 'window' ? window : host

    let frame = 0
    let clientX = 0
    let clientY = 0

    const flush = () => {
      frame = 0
      const rect = host.getBoundingClientRect()
      el.style.setProperty('--pattern-x', `${clientX - rect.left}px`)
      el.style.setProperty('--pattern-y', `${clientY - rect.top}px`)
    }

    const fade =
      !persistent && typeof el.animate === 'function'
        ? el.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: FADE_DURATION,
            easing: 'ease-out',
            fill: 'forwards',
          })
        : null
    fade?.finish()

    const handleMove = (event: PointerEvent) => {
      clientX = event.clientX
      clientY = event.clientY
      if (!frame) frame = requestAnimationFrame(flush)
      if (fade) {
        fade.currentTime = 0
        fade.play()
      }
    }

    target.addEventListener('pointermove', handleMove as EventListener, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      fade?.cancel()
      target.removeEventListener('pointermove', handleMove as EventListener)
    }
  }, [persistent, track])

  return (
    <div
      ref={ref}
      aria-hidden
      data-slot="background-pattern-highlight"
      data-persistent={persistent ? '' : undefined}
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 text-(--pattern-color)',
        persistent ? 'opacity-100' : 'opacity-0',
      )}
      style={{ WebkitMaskImage: SPOTLIGHT, maskImage: SPOTLIGHT }}
    >
      <PatternLayer variant={variant} cell={cell} className={patternSpotlight(variant)} />
    </div>
  )
}

export { BackgroundPatternInteractive }
