<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getSparklineContext, type SparklinePoint } from './sparkline-context'
  import {
    buildLinePath,
    clamp01,
    formatNumber,
    getExtent,
    readTextDirection,
    round,
    type PathPoint,
  } from './sparkline-geometry'

  type SparklineVariant = 'line' | 'area' | 'column'

  type ColumnBar = {
    top: number
    size: number
    positive: boolean
    leftFrac: number
    topFrac: number
  }

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
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
    tooltipContent?: Snippet<[SparklinePoint]>
  }

  let {
    variant = 'line',
    curve = 0.5,
    fill = false,
    baseline = 0,
    height = 48,
    strokeWidth = 2,
    indicator = true,
    tooltip = false,
    tooltipContent,
    class: className,
    style,
    role = 'img',
    'aria-label': ariaLabel,
    ...rest
  }: Props = $props()

  const ctx = getSparklineContext()
  const data = $derived(ctx.data())
  const labels = $derived(ctx.labels())
  const activeIndex = $derived(ctx.activeIndex())
  const format = $derived(ctx.format())
  const locale = $derived(ctx.locale())
  const n = $derived(data.length)

  let chartEl: HTMLDivElement | undefined = $state()
  const isRtl = $derived(readTextDirection(chartEl) === 'rtl')
  const gradientId = `sparkline-fill-${Math.random().toString(36).slice(2, 10)}`

  const showTooltip = $derived(tooltip || tooltipContent !== undefined)
  const interactive = $derived(indicator || showTooltip)

  let rectCache: DOMRect | null = null

  const geom = $derived.by(() => {
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
  })

  const columns = $derived.by(() => {
    if (variant !== 'column' || n === 0) return null
    const [dataMin, dataMax] = getExtent(data)
    const lo = Math.min(baseline, dataMin)
    const hi = Math.max(baseline, dataMax)
    const span = hi - lo || 1
    const baseFrac = (hi - baseline) / span
    const bars = data.map((value, i): ColumnBar => {
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
  })

  const showFill = $derived(geom !== null && (variant === 'area' || fill))
  const gradientFill = $derived(variant === 'line')
  const active = $derived(
    interactive && activeIndex !== null && activeIndex >= 0 && activeIndex < n ? activeIndex : null,
  )
  const marker = $derived(active === null ? null : geom ? geom.points[active] : columns!.bars[active])
  const activePoint: SparklinePoint | null = $derived(
    active === null ? null : { index: active, value: data[active]!, label: labels?.[active] },
  )

  function invalidateRect() {
    rectCache = null
  }

  function updateActiveFromEvent(event: PointerEvent, fresh: boolean) {
    const el = event.currentTarget instanceof HTMLElement ? event.currentTarget : chartEl
    if (!el) return
    const rect = fresh || rectCache === null ? (rectCache = el.getBoundingClientRect()) : rectCache
    if (rect.width === 0) return
    let t = clamp01((event.clientX - rect.left) / rect.width)
    if (isRtl) t = 1 - t
    const index = variant === 'column' ? Math.min(n - 1, Math.floor(t * n)) : Math.round(t * (n - 1))
    ctx.setActiveIndex(index)
  }

  const pointerAttach = (node: HTMLDivElement) => {
    const onDown = (event: PointerEvent) => {
      if (interactive) updateActiveFromEvent(event, true)
    }
    const onMove = (event: PointerEvent) => {
      if (interactive) updateActiveFromEvent(event, false)
    }
    const onUp = (event: PointerEvent) => {
      rectCache = null
      if (!interactive) return
      if (event.pointerType !== 'mouse') ctx.setActiveIndex(null)
    }
    const onLeave = () => {
      if (interactive) ctx.setActiveIndex(null)
    }
    node.addEventListener('pointerdown', onDown)
    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)
    node.addEventListener('pointerup', onUp)
    node.addEventListener('pointercancel', onUp)
    return () => {
      node.removeEventListener('pointerdown', onDown)
      node.removeEventListener('pointermove', onMove)
      node.removeEventListener('pointerleave', onLeave)
      node.removeEventListener('pointerup', onUp)
      node.removeEventListener('pointercancel', onUp)
    }
  }

  $effect(() => {
    if (!interactive) return
    window.addEventListener('scroll', invalidateRect, true)
    window.addEventListener('resize', invalidateRect)
    return () => {
      window.removeEventListener('scroll', invalidateRect, true)
      window.removeEventListener('resize', invalidateRect)
    }
  })
</script>

{#if n > 0}
  <div
    bind:this={chartEl}
    {role}
    aria-label={ariaLabel ?? `${variant} chart`}
    class={cn('relative w-full', className)}
    style="height: {height}px; {interactive ? 'touch-action: pan-y;' : ''}{style ? ` ${style}` : ''}"
    {...rest}
    {@attach pointerAttach}
  >
    {#if geom}
      <svg
        data-slot="sparkline-svg"
        width="100%"
        {height}
        viewBox="0 0 100 {height}"
        preserveAspectRatio="none"
        aria-hidden="true"
        class="block overflow-visible"
      >
        {#if showFill && gradientFill}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--sparkline-color)" stop-opacity={0.3} />
              <stop offset="100%" stop-color="var(--sparkline-color)" stop-opacity={0} />
            </linearGradient>
          </defs>
        {/if}
        {#if showFill}
          <path
            data-slot="sparkline-fill"
            d={geom.fillPath}
            fill={gradientFill ? `url(#${gradientId})` : 'var(--sparkline-color)'}
            fill-opacity={gradientFill ? 1 : 0.18}
          />
        {/if}
        {#if geom.baselineY !== null}
          <line
            data-slot="sparkline-baseline"
            x1="0"
            y1={geom.baselineY}
            x2="100"
            y2={geom.baselineY}
            class="stroke-border"
            stroke-width={1}
            vector-effect="non-scaling-stroke"
          />
        {/if}
        <path
          data-slot="sparkline-line"
          d={geom.d}
          fill="none"
          stroke="var(--sparkline-color)"
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    {:else if columns}
      <div dir="ltr" class={cn('flex h-full items-stretch gap-[3%]', isRtl && 'flex-row-reverse')}>
        {#each columns.bars as bar, i (i)}
          <div
            data-active={indicator && active === i ? '' : undefined}
            class="rounded-3xs data-active:bg-background-strong relative h-full flex-1"
          >
            <div
              data-slot="sparkline-column"
              class={cn(
                'absolute inset-x-0 bg-(--sparkline-color) motion-safe:transition-all motion-safe:duration-300',
                bar.positive ? 'rounded-t-[min(var(--radius-3xs),35%)]' : 'rounded-b-[min(var(--radius-3xs),35%)]',
              )}
              style="top: {bar.top}%; height: {bar.size}%"
            ></div>
          </div>
        {/each}
      </div>
      <span
        aria-hidden="true"
        data-slot="sparkline-baseline"
        class="bg-border pointer-events-none absolute inset-x-0 h-px -translate-y-1/2"
        style="top: {round(columns.baseFrac * 100)}%"
      ></span>
    {/if}

    {#if marker && indicator && geom}
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-(--sparkline-color) opacity-25 motion-safe:transition-[left] motion-safe:duration-150"
        style="left: {marker.leftFrac * 100}%"
      ></span>
      <span
        aria-hidden="true"
        class="ring-background pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--sparkline-color) ring-2 motion-safe:transition-all motion-safe:duration-150"
        style="left: {marker.leftFrac * 100}%; top: {marker.topFrac * 100}%"
      ></span>
    {/if}

    {#if marker && showTooltip && activePoint}
      <div
        data-slot="sparkline-tooltip"
        aria-hidden="true"
        class="pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-full pb-2 motion-safe:transition-[left,top] motion-safe:duration-150"
        style="left: {marker.leftFrac * 100}%; top: {marker.topFrac * 100}%"
      >
        {#if tooltipContent}
          {@render tooltipContent(activePoint)}
        {:else}
          <div
            class="border-border-overlay bg-background text-foreground-intense rounded-2xs flex items-center gap-1.5 border px-2 py-1 text-xs whitespace-nowrap shadow-md"
          >
            <span aria-hidden="true" class="size-2.5 shrink-0 rounded-[3px] bg-(--sparkline-color)"></span>
            {#if activePoint.label}
              <span class="text-foreground-muted">{activePoint.label}</span>
            {/if}
            <span class="font-medium tabular-nums">{formatNumber(activePoint.value, format, locale)}</span>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}
