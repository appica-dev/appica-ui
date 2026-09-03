import { cn } from '../../internal/utils'

type BackgroundPatternVariant = 'dots' | 'grid' | 'dashed-grid' | 'hexagons'

interface MaskSpec {
  maskImage: string
  maskSize?: string
  maskRepeat?: string
  cell: number
  tint: string
  spotlight: string
  className?: string
}

const CELL = 'var(--pattern-cell) var(--pattern-cell)'

function svgMask(body: string, width = 12, height = width) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${body}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

const PATTERN_MASKS: Record<BackgroundPatternVariant, MaskSpec> = {
  dots: {
    maskImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 1.5px)',
    cell: 14,
    tint: 'bg-current/12',
    spotlight: 'bg-current/58 dark:bg-current/64',
  },
  grid: {
    maskImage:
      'linear-gradient(to right, #000 0 1px, transparent 1px), linear-gradient(to bottom, #000 0 1px, transparent 1px)',
    cell: 28,
    tint: 'bg-current/7',
    spotlight: 'bg-current/28 dark:bg-current/34',
  },
  'dashed-grid': {
    maskImage: svgMask(`<path d='M0 0H12 M0 0V12' stroke='#000' stroke-width='1' stroke-dasharray='2 2'/>`),
    cell: 28,
    tint: 'bg-current/11',
    spotlight: 'bg-current/40 dark:bg-current/44',
  },
  hexagons: {
    maskImage: svgMask(
      `<path d='M0 10L8.660254 5 17.320508 10 17.320508 20 8.660254 25 0 20Z M8.660254 0V5 M8.660254 25V30' fill='none' stroke='#000' stroke-width='0.5'/>`,
      17.320508,
      30,
    ),
    maskSize: 'var(--pattern-cell) calc(var(--pattern-cell) * 1.7320508)',
    cell: 40,
    tint: 'bg-current/7',
    spotlight: 'bg-current/28 dark:bg-current/34',
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

function patternMaskStyle(variant: BackgroundPatternVariant) {
  const spec = PATTERN_MASKS[variant]
  const maskImage = spec.maskImage
  const maskSize = spec.maskSize ?? CELL
  const maskRepeat = spec.maskRepeat ?? 'repeat'
  return `-webkit-mask-image: ${maskImage}; mask-image: ${maskImage}; -webkit-mask-size: ${maskSize}; mask-size: ${maskSize}; -webkit-mask-repeat: ${maskRepeat}; mask-repeat: ${maskRepeat}`
}

function patternLayerClass(variant: BackgroundPatternVariant, className?: string) {
  return cn('pointer-events-none absolute inset-0', PATTERN_MASKS[variant].className, className)
}

export { patternCell, patternTint, patternSpotlight, patternMaskStyle, patternLayerClass }
export type { BackgroundPatternVariant }
