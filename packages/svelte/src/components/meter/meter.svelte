<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import {
    clampMeterValue,
    computeStatus,
    DEFAULT_STATUS_CLASSES,
    formatMeterValue,
    percentOf,
    setMeterContext,
    type MeterStatusClassNames,
  } from './meter-context'

  export type MeterProps = HTMLAttributes<HTMLDivElement> & {
    /** The current value. */
    value: number
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
    /** Upper edge of the "low" zone. Enables status coloring. */
    low?: number
    /** Lower edge of the "high" zone. Enables status coloring. */
    high?: number
    /** The ideal value; the zone it lands in becomes the green "optimum" zone. Enables status coloring. */
    optimum?: number
    /** Override the indicator background class per status (and the no-threshold `default`). */
    statusClassNames?: MeterStatusClassNames
    /** Formatting passed to `Intl.NumberFormat` for the displayed value. */
    format?: Intl.NumberFormatOptions
    /** Locale used by `Intl.NumberFormat`. */
    locale?: Intl.LocalesArgument
    /** Build the human-readable `aria-valuetext`. */
    getAriaValueText?: (formatted: string, value: number) => string
    children?: Snippet
  }

  let {
    value,
    min = 0,
    max = 100,
    low,
    high,
    optimum,
    statusClassNames,
    format,
    locale,
    getAriaValueText,
    class: className,
    children,
    ...rest
  }: MeterProps = $props()

  let labelId = $state<string | undefined>(undefined)

  const hasThresholds = $derived(low !== undefined || high !== undefined || optimum !== undefined)
  const status = $derived(hasThresholds ? computeStatus(value, min, max, low, high, optimum) : null)
  const resolvedClasses = $derived({ ...DEFAULT_STATUS_CLASSES, ...statusClassNames })
  const indicatorBg = $derived(status === null ? resolvedClasses.default : resolvedClasses[status])
  const pct = $derived(percentOf(value, min, max))
  const clampedValue = $derived(clampMeterValue(value, min, max))
  const formatted = $derived(formatMeterValue(value, min, max, format, locale))
  const ariaValueText = $derived(getAriaValueText ? getAriaValueText(formatted, value) : formatted)

  setMeterContext({
    value: () => value,
    min: () => min,
    max: () => max,
    formatted: () => formatted,
    indicatorBg: () => indicatorBg,
    percent: () => pct,
    labelId: () => labelId,
    setLabelId: (id) => {
      labelId = id
    },
  })
</script>

<div
  data-slot="meter"
  data-status={status ?? undefined}
  role="meter"
  aria-valuemin={min}
  aria-valuemax={max}
  aria-valuenow={clampedValue}
  aria-valuetext={ariaValueText}
  aria-labelledby={labelId}
  class={cn(
    'grid w-full grid-cols-[1fr_auto] gap-x-2 gap-y-1.5',
    '**:data-[slot=meter-label]:col-start-1 **:data-[slot=meter-label]:row-start-1',
    '**:data-[slot=meter-value]:col-start-2 **:data-[slot=meter-value]:row-start-1 **:data-[slot=meter-value]:justify-self-end',
    '**:data-[slot=meter-progress]:col-span-2',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
