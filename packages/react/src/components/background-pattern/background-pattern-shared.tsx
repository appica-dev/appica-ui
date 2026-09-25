import { cn } from '../../internal/utils'

type BackgroundPatternVariant = 'dots' | 'grid' | 'hexagons' | 'rings' | 'checkerboard'

interface MaskSpec {
  maskImage: string | ((cell: number) => string)
  maskSize?: string
  maskRepeat?: string
  cell: number
  tint: string
  spotlight: string
  className?: string
}

const CELL = 'var(--pattern-cell) var(--pattern-cell)'

const GRID_DOT_RADIUS = 1
const GRID_GAP = 3
const RING_RADIUS = 4.5
const RING_STROKE = 2

function svgMask(body: string, width = 12, height = width) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${body}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function corners(cell: number): [number, number][] {
  return [
    [0, 0],
    [cell, 0],
    [0, cell],
    [cell, cell],
  ]
}

function gridMask(cell: number) {
  const start = 0.5 + GRID_DOT_RADIUS + GRID_GAP
  const end = cell + 0.5 - GRID_DOT_RADIUS - GRID_GAP
  const lines = end > start ? `<path d='M${start} .5H${end}M.5 ${start}V${end}' stroke='#000'/>` : ''
  const dots = corners(cell)
    .map(([x, y]) => `<circle cx='${x + 0.5}' cy='${y + 0.5}' r='${GRID_DOT_RADIUS}'/>`)
    .join('')
  return svgMask(lines + dots, cell)
}

function ringsMask(cell: number) {
  const centers: [number, number][] = [...corners(cell), [cell / 2, cell / 2]]
  const rings = centers.map(([x, y]) => `<circle cx='${x}' cy='${y}' r='${RING_RADIUS}'/>`).join('')
  return svgMask(`<g fill='none' stroke='#000' stroke-width='${RING_STROKE}'>${rings}</g>`, cell)
}

const PATTERN_MASKS: Record<BackgroundPatternVariant, MaskSpec> = {
  dots: {
    maskImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 1.5px)',
    cell: 14,
    tint: 'bg-current/14',
    spotlight: 'bg-current/62 dark:bg-current/68',
  },
  grid: {
    maskImage: gridMask,
    cell: 28,
    tint: 'bg-current/9',
    spotlight: 'bg-current/32 dark:bg-current/38',
  },
  hexagons: {
    maskImage: svgMask(
      `<path d='M0 10L8.660254 5 17.320508 10 17.320508 20 8.660254 25 0 20Z M8.660254 0V5 M8.660254 25V30' fill='none' stroke='#000' stroke-width='0.5'/>`,
      17.320508,
      30,
    ),
    maskSize: 'var(--pattern-cell) calc(var(--pattern-cell) * 1.7320508)',
    cell: 40,
    tint: 'bg-current/9',
    spotlight: 'bg-current/32 dark:bg-current/38',
  },
  rings: {
    maskImage: ringsMask,
    cell: 48,
    tint: 'bg-current/9',
    spotlight: 'bg-current/32 dark:bg-current/38',
  },
  checkerboard: {
    maskImage: 'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)',
    maskSize: 'calc(var(--pattern-cell) * 2) calc(var(--pattern-cell) * 2)',
    cell: 16,
    tint: 'bg-current/5',
    spotlight: 'bg-current/12 dark:bg-current/14',
  },
}

function patternCell(variant: BackgroundPatternVariant) {
  return PATTERN_MASKS[variant].cell
}

function patternTint(variant: BackgroundPatternVariant) {
  return PATTERN_MASKS[variant].tint
}

function patternSpotlight(variant: BackgroundPatternVariant) {
  return PATTERN_MASKS[variant].spotlight
}

interface PatternLayerProps {
  variant: BackgroundPatternVariant
  cell: number
  className?: string
}

function PatternLayer({ variant, cell, className }: PatternLayerProps) {
  const spec = PATTERN_MASKS[variant]
  const maskImage = typeof spec.maskImage === 'function' ? spec.maskImage(cell) : spec.maskImage
  const maskSize = spec.maskSize ?? CELL
  const maskRepeat = spec.maskRepeat ?? 'repeat'

  return (
    <div
      aria-hidden
      data-slot="background-pattern-layer"
      className={cn('pointer-events-none absolute inset-0', spec.className, className)}
      style={{
        WebkitMaskImage: maskImage,
        maskImage,
        WebkitMaskSize: maskSize,
        maskSize,
        WebkitMaskRepeat: maskRepeat,
        maskRepeat,
      }}
    />
  )
}

export { PatternLayer, patternCell, patternTint, patternSpotlight }
export type { BackgroundPatternVariant }
