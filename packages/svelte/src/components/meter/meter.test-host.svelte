<script lang="ts">
  import Meter from './meter.svelte'
  import MeterLabel from './meter-label.svelte'
  import MeterProgress from './meter-progress.svelte'
  import MeterValue from './meter-value.svelte'
  import type { MeterStatusClassNames } from './meter-context'

  let {
    value = 60,
    min,
    max,
    low,
    high,
    optimum,
    statusClassNames,
    format,
    locale,
    getAriaValueText,
    class: className,
    showLabel = false,
    label = 'Storage',
    showValue = false,
    showValueSnippet = false,
  }: {
    value?: number
    min?: number
    max?: number
    low?: number
    high?: number
    optimum?: number
    statusClassNames?: MeterStatusClassNames
    format?: Intl.NumberFormatOptions
    locale?: Intl.LocalesArgument
    getAriaValueText?: (formatted: string, value: number) => string
    class?: string
    showLabel?: boolean
    label?: string
    showValue?: boolean
    showValueSnippet?: boolean
  } = $props()
</script>

<Meter
  {value}
  {min}
  {max}
  {low}
  {high}
  {optimum}
  {statusClassNames}
  {format}
  {locale}
  {getAriaValueText}
  class={className}
>
  {#if showLabel}
    <MeterLabel>{label}</MeterLabel>
  {/if}
  {#if showValueSnippet}
    <MeterValue>
      {#snippet children(formatted, current)}
        {formatted}|{current}
      {/snippet}
    </MeterValue>
  {:else if showValue}
    <MeterValue />
  {/if}
  <MeterProgress />
</Meter>
