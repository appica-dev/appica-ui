<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import {
    formatPercent,
    percentOf,
    setProgressContext,
    type ProgressVariant,
  } from './progress-context'

  export type ProgressProps = HTMLAttributes<HTMLDivElement> & {
    /**
     * Horizontal track or SVG ring.
     * @default 'bar'
     */
    variant?: ProgressVariant
    /**
     * Diameter of the ring in pixels (`circular` only).
     * @default 56
     */
    size?: number
    /**
     * Track weight in pixels. Defaults to `6` for `bar`, `4` for `circular`.
     * @default 6 / 4
     */
    thickness?: number
    /**
     * Any CSS color for the fill (e.g. `var(--success-emphasis)`).
     * @default primary token
     */
    indicatorColor?: string
    /** Current value, from `min` to `max`. Pass `null` for an indeterminate state. */
    value?: number | null
    /**
     * Lower bound of the range.
     * @default 0
     */
    min?: number
    /**
     * Upper bound of the range.
     * @default 100
     */
    max?: number
    /** Formatting passed to `Intl.NumberFormat` for the displayed value. */
    format?: Intl.NumberFormatOptions
    /** Locale used by `Intl.NumberFormat`. */
    locale?: Intl.LocalesArgument
    /** Build the human-readable `aria-valuetext`. */
    getAriaValueText?: (formatted: string, value: number) => string
    children?: Snippet
  }

  let {
    variant = 'bar',
    size,
    thickness,
    indicatorColor,
    value = null,
    min = 0,
    max = 100,
    format,
    locale,
    getAriaValueText,
    class: className,
    style,
    children,
    ...rest
  }: ProgressProps = $props()

  let labelId = $state<string | undefined>(undefined)

  setProgressContext({
    value: () => value,
    min: () => min,
    max: () => max,
    format: () => format,
    locale: () => locale,
    labelId: () => labelId,
    setLabelId: (id) => {
      labelId = id
    },
  })

  const resolvedThickness = $derived(thickness ?? (variant === 'circular' ? 4 : 6))
  const resolvedSize = $derived(size ?? 56)
  const pct = $derived(percentOf(value, min, max))
  const complete = $derived(value != null && value >= max)
  const progressing = $derived(value != null && value < max)
  const formatted = $derived(formatPercent(value, min, max, format, locale))
  const valueText = $derived(
    value == null ? undefined : (getAriaValueText?.(formatted, value) ?? formatted),
  )

  const center = $derived(resolvedSize / 2)
  const radius = $derived((resolvedSize - resolvedThickness) / 2)
  const circumference = $derived(2 * Math.PI * radius)
  const offset = $derived(circumference - (pct / 100) * circumference)
</script>

<div
  data-slot="progress"
  data-variant={variant}
  data-complete={complete ? '' : undefined}
  data-progressing={progressing ? '' : undefined}
  role="progressbar"
  aria-valuemin={min}
  aria-valuemax={max}
  aria-valuenow={value == null ? undefined : value}
  aria-valuetext={valueText}
  aria-labelledby={labelId}
  style:--progress-color={indicatorColor ?? 'var(--primary)'}
  {style}
  class={cn(
    'grid w-full gap-x-2 gap-y-1.5',
    'data-[variant=bar]:grid-cols-[1fr_auto]',
    'data-[variant=bar]:**:data-[slot=progress-label]:col-start-1 data-[variant=bar]:**:data-[slot=progress-label]:row-start-1',
    'data-[variant=bar]:**:data-[slot=progress-value]:col-start-2 data-[variant=bar]:**:data-[slot=progress-value]:row-start-1 data-[variant=bar]:**:data-[slot=progress-value]:justify-self-end',
    'data-[variant=bar]:**:data-[slot=progress-track]:col-span-2',
    'data-[variant=circular]:w-fit data-[variant=circular]:justify-items-center',
    'data-[variant=circular]:**:data-[slot=progress-circular]:col-start-1 data-[variant=circular]:**:data-[slot=progress-circular]:row-start-1',
    'data-[variant=circular]:**:data-[slot=progress-value]:col-start-1 data-[variant=circular]:**:data-[slot=progress-value]:row-start-1 data-[variant=circular]:**:data-[slot=progress-value]:place-self-center',
    'data-[variant=circular]:**:data-[slot=progress-label]:row-start-2',
    className,
  )}
  {...rest}
>
  {@render children?.()}
  {#if variant === 'bar'}
    <div
      data-slot="progress-track"
      class="bg-background-strong relative w-full overflow-hidden rounded-full"
      style:height="{resolvedThickness}px"
    >
      <div
        data-slot="progress-indicator"
        data-complete={complete ? '' : undefined}
        class="h-full rounded-full bg-(--progress-color) transition-[width] duration-300 motion-reduce:transition-none"
        style:width="{pct}%"
      ></div>
    </div>
  {:else}
    <svg
      data-slot="progress-circular"
      width={resolvedSize}
      height={resolvedSize}
      viewBox={`0 0 ${resolvedSize} ${resolvedSize}`}
      aria-hidden="true"
      class="overflow-visible"
    >
      <circle
        data-slot="progress-track"
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke-width={resolvedThickness}
        class="stroke-background-strong"
      />
      <circle
        data-slot="progress-indicator"
        data-complete={complete ? '' : undefined}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke-width={resolvedThickness}
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        style:stroke="var(--progress-color)"
        class="transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none"
      />
    </svg>
  {/if}
</div>
