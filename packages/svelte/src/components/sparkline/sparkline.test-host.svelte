<script lang="ts">
  import Sparkline from './sparkline.svelte'
  import SparklineChart from './sparkline-chart.svelte'
  import SparklineLabel from './sparkline-label.svelte'
  import SparklineValue from './sparkline-value.svelte'
  import type { SparklinePoint } from './sparkline-context'

  let {
    data = [4, 8, 6, 10, 7, 12],
    labels,
    color,
    format,
    locale,
    onActiveChange,
    variant = 'line',
    fill = false,
    indicator = true,
    tooltip = false,
    showValue = false,
    showLabel = false,
    chartClass,
    ariaLabel,
    rtl = false,
    testId,
  }: {
    data?: number[]
    labels?: string[]
    color?: string
    format?: Intl.NumberFormatOptions
    locale?: Intl.LocalesArgument
    onActiveChange?: (point: SparklinePoint | null) => void
    variant?: 'line' | 'area' | 'column'
    fill?: boolean
    indicator?: boolean
    tooltip?: boolean
    showValue?: boolean
    showLabel?: boolean
    chartClass?: string
    ariaLabel?: string
    rtl?: boolean
    testId?: string
  } = $props()
</script>

<div dir={rtl ? 'rtl' : undefined}>
  <Sparkline {data} {labels} {color} {format} {locale} {onActiveChange} data-testid={testId}>
    {#if showValue}
      <SparklineValue />
    {/if}
    {#if showLabel}
      <SparklineLabel data-testid="label" />
    {/if}
    <SparklineChart {variant} {fill} {indicator} {tooltip} class={chartClass} aria-label={ariaLabel} />
  </Sparkline>
</div>
