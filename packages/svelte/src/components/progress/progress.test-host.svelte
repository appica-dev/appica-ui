<script lang="ts">
  import Progress from './progress.svelte'
  import ProgressLabel from './progress-label.svelte'
  import ProgressValue from './progress-value.svelte'
  import type { ProgressVariant } from './progress-context'

  let {
    value = 0,
    variant = 'bar',
    size,
    thickness,
    indicatorColor,
    min,
    max,
    format,
    locale,
    getAriaValueText,
    class: className,
    showLabel = false,
    label = 'Loading',
    showValue = false,
    customValue = false,
  }: {
    value?: number | null
    variant?: ProgressVariant
    size?: number
    thickness?: number
    indicatorColor?: string
    min?: number
    max?: number
    format?: Intl.NumberFormatOptions
    locale?: Intl.LocalesArgument
    getAriaValueText?: (formatted: string, value: number) => string
    class?: string
    showLabel?: boolean
    label?: string
    showValue?: boolean
    customValue?: boolean
  } = $props()
</script>

<Progress
  {value}
  {variant}
  {size}
  {thickness}
  {indicatorColor}
  {min}
  {max}
  {format}
  {locale}
  {getAriaValueText}
  class={className}
>
  {#if showLabel}
    <ProgressLabel>{label}</ProgressLabel>
  {/if}
  {#if customValue}
    <ProgressValue>
      {#snippet children(formatted, current)}
        {current} ({formatted})
      {/snippet}
    </ProgressValue>
  {:else if showValue}
    <ProgressValue />
  {/if}
</Progress>
