'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'

type SparklineVariant = 'line' | 'area' | 'column'

interface SparklinePoint {
  index: number
  value: number
  label?: string
}

interface SparklineContextValue {
  data: number[]
  labels?: string[]
  activeIndex: number | null
  setActiveIndex: (index: number | null) => void
  format?: Intl.NumberFormatOptions
  locale?: Intl.LocalesArgument
}

const SparklineContext = React.createContext<SparklineContextValue | null>(null)

function useSparkline(): SparklineContextValue {
  const ctx = React.useContext(SparklineContext)
  if (ctx === null) {
    throw new Error('Sparkline parts must be rendered inside <Sparkline>.')
  }
  return ctx
}

interface SparklineProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  /** **Required.** The series to plot. */
  data: number[]
  /** Per-point labels (e.g. dates), surfaced in the tooltip and to `SparklineLabel`. */
  labels?: string[]
  /**
   * Accent for the line, fill, indicator, and tooltip swatch. Any CSS color.
   * @default var(--primary)
   */
  color?: string
  /** Formatting for displayed values (`SparklineValue`, tooltip). */
  format?: Intl.NumberFormatOptions
  /** Locale used by `Intl.NumberFormat`. */
  locale?: Intl.LocalesArgument
  /** Fires when the hovered point changes; `null` on pointer leave. */
  onActiveChange?: (point: SparklinePoint | null) => void
}

function Sparkline({
  data,
  labels,
  color,
  format,
  locale,
  onActiveChange,
  className,
  style,
  children,
  ...props
}: SparklineProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  const onActiveChangeRef = React.useRef(onActiveChange)
  const dataRef = React.useRef(data)
  const labelsRef = React.useRef(labels)
  React.useEffect(() => {
    onActiveChangeRef.current = onActiveChange
    dataRef.current = data
    labelsRef.current = labels
  })

  const notifiedMountRef = React.useRef(false)
  React.useEffect(() => {
    if (!notifiedMountRef.current) {
      notifiedMountRef.current = true
      return
    }
    const cb = onActiveChangeRef.current
    if (!cb) return
    if (activeIndex === null) {
      cb(null)
      return
    }
    cb({ index: activeIndex, value: dataRef.current[activeIndex]!, label: labelsRef.current?.[activeIndex] })
  }, [activeIndex])

  const ctx = React.useMemo<SparklineContextValue>(
    () => ({ data, labels, activeIndex, setActiveIndex, format, locale }),
    [data, labels, activeIndex, format, locale],
  )

  const rootStyle = { ...style, '--sparkline-color': color ?? 'var(--primary)' } as React.CSSProperties

  return (
    <SparklineContext.Provider value={ctx}>
      <div data-slot="sparkline" className={cn('flex flex-col gap-1.5', className)} style={rootStyle} {...props}>
        {children}
      </div>
    </SparklineContext.Provider>
  )
}

interface SparklineChartProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /**
   * The layout.
   * @default 'line'
   */
  variant?: SparklineVariant
  /**
   * Line smoothing from `0` (straight) to `1` (fully rounded). Line/area only.
   * @default 0.5
   */
  curve?: number
  /**
   * **`line` only.** Add a gradient fill from the line to the bottom edge. Area is always filled.
   * @default false
   */
  fill?: boolean
  /**
   * The pivot the fill/bars grow from; values below it render below. Area and column.
   * @default 0
   */
  baseline?: number
  /**
   * Chart height, in pixels.
   * @default 48
   */
  height?: number
  /**
   * Line thickness, in pixels. Line/area only.
   * @default 2
   */
  strokeWidth?: number
  /**
   * Show the hover indicator (dot + guide, or the active-column highlight).
   * @default true
   */
  indicator?: boolean
  /**
   * Float a tooltip at the hovered point.
   * @default false
   */
  tooltip?: boolean
  /** Render custom tooltip content instead of the default swatch + value. Implies `tooltip`. */
  renderTooltip?: (point: SparklinePoint) => React.ReactNode
}

function SparklineChart({
  variant = 'line',
  curve = 0.5,
  fill = false,
  baseline = 0,
  height = 48,
  strokeWidth = 2,
  indicator = true,
  tooltip = false,
  renderTooltip,
  className,
  style,
  role = 'img',
  'aria-label': ariaLabel,
  ...props
}: SparklineChartProps) {
  const { data, labels, activeIndex, setActiveIndex, format, locale } = useSparkline()
  const dir = useDirection()
  const isRtl = dir === 'rtl'
  const gradientId = React.useId()
  const n = data.length

  const showTooltip = tooltip || renderTooltip !== undefined
  const interactive = indicator || showTooltip

  const rectRef = React.useRef<DOMRect | null>(null)
  React.useEffect(() => {
    if (!interactive) return
    const invalidate = () => {
      rectRef.current = null
    }
    window.addEventListener('scroll', invalidate, true)
    window.addEventListener('resize', invalidate)
    return () => {
      window.removeEventListener('scroll', invalidate, true)
      window.removeEventListener('resize', invalidate)
    }
  }, [interactive])

  const geom = React.useMemo(() => {
    if (variant === 'column' || n === 0) return null
    const isArea = variant === 'area'
    const [dataMin, dataMax] = getExtent(data)
    const lo = isArea ? Math.min(baseline, dataMin) : dataMin
    const hi = isArea ? Math.max(baseline, dataMax) : dataMax
    const span = hi - lo || 1
    const inset = strokeWidth + 1
    const plot = height - inset * 2
    const yOf = (value: number) => inset + (1 - (value - lo) / span) * plot
    const points = data.map<PathPoint>((value, i) => {
      const frac = n === 1 ? 0.5 : i / (n - 1)
      const xFrac = isRtl ? 1 - frac : frac
      const y = yOf(value)
      return { x: round(xFrac * 100), y: round(y), leftFrac: xFrac, topFrac: y / height }
    })
    const d = buildLinePath(points, clamp01(curve))
    const foot = isArea ? round(yOf(baseline)) : height
    const fillPath = `${d} L ${points[n - 1]!.x} ${foot} L ${points[0]!.x} ${foot} Z`
    return { d, fillPath, points, baselineY: isArea ? round(yOf(baseline)) : null }
  }, [data, variant, curve, height, strokeWidth, baseline, isRtl, n])

  const columns = React.useMemo(() => {
    if (variant !== 'column' || n === 0) return null
    const [dataMin, dataMax] = getExtent(data)
    const lo = Math.min(baseline, dataMin)
    const hi = Math.max(baseline, dataMax)
    const span = hi - lo || 1
    const baseFrac = (hi - baseline) / span
    const bars = data.map((value, i) => {
      const valueFrac = (hi - value) / span
      const center = (i + 0.5) / n
      return {
        top: round(Math.min(valueFrac, baseFrac) * 100),
        size: round(Math.abs(valueFrac - baseFrac) * 100),
        positive: value >= baseline,
        leftFrac: isRtl ? 1 - center : center,
        topFrac: valueFrac,
      }
    })
    return { bars, baseFrac }
  }, [data, variant, baseline, isRtl, n])

  if (n === 0) return null

  const showFill = geom !== null && (variant === 'area' || fill)
  const gradientFill = variant === 'line'

  const active = interactive && activeIndex !== null && activeIndex >= 0 && activeIndex < n ? activeIndex : null
  const marker = active === null ? null : geom ? geom.points[active] : columns!.bars[active]
  const activePoint: SparklinePoint | null =
    active === null ? null : { index: active, value: data[active]!, label: labels?.[active] }

  function updateActiveFromEvent(event: React.PointerEvent<HTMLDivElement>, fresh: boolean) {
    const rect =
      fresh || rectRef.current === null
        ? (rectRef.current = event.currentTarget.getBoundingClientRect())
        : rectRef.current
    if (rect.width === 0) return
    let t = clamp01((event.clientX - rect.left) / rect.width)
    if (isRtl) t = 1 - t
    const index = variant === 'column' ? Math.min(n - 1, Math.floor(t * n)) : Math.round(t * (n - 1))
    setActiveIndex(index)
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    updateActiveFromEvent(event, true)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    updateActiveFromEvent(event, false)
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    rectRef.current = null
    if (event.pointerType !== 'mouse') setActiveIndex(null)
  }

  return (
    <div
      role={role}
      aria-label={ariaLabel ?? `${variant} chart`}
      className={cn('relative w-full', className)}
      style={{ height, touchAction: interactive ? 'pan-y' : undefined, ...style }}
      data-base-ui-swipe-ignore={interactive ? 'x' : undefined}
      onPointerDown={interactive ? handlePointerDown : undefined}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerLeave={interactive ? () => setActiveIndex(null) : undefined}
      onPointerUp={interactive ? handlePointerUp : undefined}
      onPointerCancel={interactive ? handlePointerUp : undefined}
      {...props}
    >
      {geom ? (
        <svg
          data-slot="sparkline-svg"
          width="100%"
          height={height}
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          className="block overflow-visible"
        >
          {showFill && gradientFill ? (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--sparkline-color)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--sparkline-color)" stopOpacity={0} />
              </linearGradient>
            </defs>
          ) : null}
          {showFill ? (
            <path
              data-slot="sparkline-fill"
              d={geom.fillPath}
              fill={gradientFill ? `url(#${gradientId})` : 'var(--sparkline-color)'}
              fillOpacity={gradientFill ? 1 : 0.18}
            />
          ) : null}
          {geom.baselineY !== null ? (
            <line
              data-slot="sparkline-baseline"
              x1="0"
              y1={geom.baselineY}
              x2="100"
              y2={geom.baselineY}
              className="stroke-border"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          <path
            data-slot="sparkline-line"
            d={geom.d}
            fill="none"
            stroke="var(--sparkline-color)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : (
        <>
          <div dir="ltr" className={cn('flex h-full items-stretch gap-[3%]', isRtl && 'flex-row-reverse')}>
            {columns!.bars.map((bar, i) => (
              <div
                key={i}
                data-active={(indicator && active === i) || undefined}
                className="rounded-3xs data-active:bg-background-strong relative h-full flex-1"
              >
                <div
                  data-slot="sparkline-column"
                  className={cn(
                    'absolute inset-x-0 bg-(--sparkline-color) motion-safe:transition-all motion-safe:duration-300',
                    bar.positive ? 'rounded-t-[min(var(--radius-3xs),35%)]' : 'rounded-b-[min(var(--radius-3xs),35%)]',
                  )}
                  style={{ top: `${bar.top}%`, height: `${bar.size}%` }}
                />
              </div>
            ))}
          </div>
          <span
            aria-hidden="true"
            data-slot="sparkline-baseline"
            className="bg-border pointer-events-none absolute inset-x-0 h-px -translate-y-1/2"
            style={{ top: `${round(columns!.baseFrac * 100)}%` }}
          />
        </>
      )}

      {marker && indicator && geom ? (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-(--sparkline-color) opacity-25 motion-safe:transition-[left] motion-safe:duration-150"
            style={{ left: `${marker.leftFrac * 100}%` }}
          />
          <span
            aria-hidden="true"
            className="ring-background pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--sparkline-color) ring-2 motion-safe:transition-all motion-safe:duration-150"
            style={{ left: `${marker.leftFrac * 100}%`, top: `${marker.topFrac * 100}%` }}
          />
        </>
      ) : null}

      {marker && showTooltip && activePoint ? (
        <div
          data-slot="sparkline-tooltip"
          aria-hidden="true"
          className="pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-full pb-2 motion-safe:transition-[left,top] motion-safe:duration-150"
          style={{ left: `${marker.leftFrac * 100}%`, top: `${marker.topFrac * 100}%` }}
        >
          {renderTooltip ? (
            renderTooltip(activePoint)
          ) : (
            <div className="border-border-overlay bg-background text-foreground-intense rounded-2xs flex items-center gap-1.5 border px-2 py-1 text-xs whitespace-nowrap shadow-md">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px] bg-(--sparkline-color)" />
              {activePoint.label ? <span className="text-foreground-muted">{activePoint.label}</span> : null}
              <span className="font-medium tabular-nums">{formatNumber(activePoint.value, format, locale)}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

type SparklineValueProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** Render function to fully customize the displayed text. Omit for the number. */
  children?: (formatted: string, value: number) => React.ReactNode
}

function SparklineValue({ className, children, ...props }: SparklineValueProps) {
  const { data, activeIndex, format, locale } = useSparkline()
  const index = activeIndex ?? data.length - 1
  const value = data[index] ?? NaN
  const formatted = formatNumber(value, format, locale)
  return (
    <span
      data-slot="sparkline-value"
      className={cn('text-foreground-intense text-sm font-semibold tabular-nums', className)}
      {...props}
    >
      {children ? children(formatted, value) : formatted}
    </span>
  )
}

type SparklineLabelProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  /** Render function to customize the displayed text. Omit for the raw label. */
  children?: (label: string, point: SparklinePoint) => React.ReactNode
}

function SparklineLabel({ className, children, ...props }: SparklineLabelProps) {
  const { data, labels, activeIndex } = useSparkline()
  if (!labels) return null
  const index = activeIndex ?? data.length - 1
  const label = labels[index] ?? ''
  return (
    <span data-slot="sparkline-label" className={cn('text-foreground-muted text-xs', className)} {...props}>
      {children ? children(label, { index, value: data[index] ?? NaN, label }) : label}
    </span>
  )
}

interface PathPoint {
  x: number
  y: number
  leftFrac: number
  topFrac: number
}

function getExtent(data: number[]): [number, number] {
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < data.length; i++) {
    const v = data[i]!
    if (v < min) min = v
    if (v > max) max = v
  }
  return [min, max]
}

function buildLinePath(points: PathPoint[], smoothing: number): string {
  if (points.length === 0) return ''
  let d = `M ${points[0]!.x} ${points[0]!.y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p0 = points[i - 1] ?? p1
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * smoothing
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * smoothing
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * smoothing
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * smoothing
    d += ` C ${round(cp1x)} ${round(cp1y)}, ${round(cp2x)} ${round(cp2y)}, ${p2.x} ${p2.y}`
  }
  return d
}

const numberFormatCache = new Map<string, Intl.NumberFormat>()

function getNumberFormat(format?: Intl.NumberFormatOptions, locale?: Intl.LocalesArgument): Intl.NumberFormat {
  const cacheKey = JSON.stringify([locale ?? '', format ?? {}])
  let formatter = numberFormatCache.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, format)
    numberFormatCache.set(cacheKey, formatter)
  }
  return formatter
}

function formatNumber(value: number, format?: Intl.NumberFormatOptions, locale?: Intl.LocalesArgument): string {
  if (!Number.isFinite(value)) return ''
  return getNumberFormat(format, locale).format(value)
}

const round = (n: number) => Math.round(n * 100) / 100
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export { Sparkline, SparklineChart, SparklineValue, SparklineLabel }
export type { SparklineProps, SparklineChartProps, SparklineValueProps, SparklineLabelProps, SparklinePoint }
