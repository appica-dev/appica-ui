import * as React from 'react'
import { cn } from '../../internal/utils'
import { PatternLayer, patternCell, patternTint, type BackgroundPatternVariant } from './background-pattern-shared'
import { BackgroundPatternInteractive } from './background-pattern-interactive'

type SpotlightConfig = { size?: number | string; persistent?: boolean }

interface BackgroundPatternProps extends React.ComponentProps<'div'> {
  /**
   * Pattern texture painted behind the content.
   * @default 'dots'
   */
  variant?: BackgroundPatternVariant
  /**
   * Cursor-following highlight. `true` for a 200px fading highlight; a number/length sizes it; an object with
   * `persistent: true` keeps it always on.
   * @default false
   */
  spotlight?: boolean | number | string | SpotlightConfig
  /** Cell size in px; overrides the per-variant default (dots 14, grid 28, hexagons 40, rings 48; checkerboard 16, per square). */
  cellSize?: number
  /**
   * Where the spotlight reads pointer movement. `'self'` tracks over this element; `'window'` tracks anywhere - for a
   * pattern positioned behind unrelated content.
   * @default 'self'
   */
  track?: 'self' | 'window'
}

function resolveSpotlight(
  spotlight: BackgroundPatternProps['spotlight'],
): { size?: number | string; persistent: boolean } | null {
  if (!spotlight) return null
  if (spotlight === true) return { persistent: false }
  if (typeof spotlight === 'object') return { size: spotlight.size, persistent: spotlight.persistent ?? false }
  return { size: spotlight, persistent: false }
}

function BackgroundPattern({
  variant = 'dots',
  spotlight = false,
  cellSize,
  track = 'self',
  className,
  style,
  children,
  ...props
}: BackgroundPatternProps) {
  const spot = resolveSpotlight(spotlight)
  const cell = cellSize ?? patternCell(variant)
  const cssVars = {
    '--pattern-cell': `${cell}px`,
    ...(spot?.size != null && {
      '--spotlight-size': typeof spot.size === 'number' ? `${spot.size}px` : spot.size,
    }),
  } as React.CSSProperties

  return (
    <div
      data-slot="background-pattern"
      className={cn(
        'relative isolate [--pattern-color:var(--color-border-intense)] [--pattern-highlight:var(--spotlight-size)] [--spotlight-size:200px]',
        className,
      )}
      style={{ ...cssVars, ...style }}
      {...props}
    >
      <PatternLayer
        variant={variant}
        cell={cell}
        className={cn('-z-10 text-(--pattern-color)', patternTint(variant))}
      />
      {spot ? (
        <BackgroundPatternInteractive variant={variant} cell={cell} persistent={spot.persistent} track={track} />
      ) : null}
      {children}
    </div>
  )
}

export { BackgroundPattern }
export type { BackgroundPatternProps }
