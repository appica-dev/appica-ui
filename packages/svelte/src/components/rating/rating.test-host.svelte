<script lang="ts">
  import Rating from './rating.svelte'
  import type { RatingOrientation } from './rating-model'

  let {
    value,
    defaultValue,
    onValueChange,
    count,
    step,
    variant,
    orientation,
    size,
    hoverable,
    clearable,
    disabled,
    readOnly,
    name,
    class: className,
    style,
    customIcon = false,
    rtl = false,
  }: {
    value?: number
    defaultValue?: number
    onValueChange?: (value: number) => void
    count?: number
    step?: number
    variant?: 'filled' | 'outline'
    orientation?: RatingOrientation
    size?: number | string
    hoverable?: boolean
    clearable?: boolean
    disabled?: boolean
    readOnly?: boolean
    name?: string
    class?: string
    style?: string
    customIcon?: boolean
    rtl?: boolean
  } = $props()
</script>

{#snippet empty()}
  <svg data-testid="empty"></svg>
{/snippet}
{#snippet filled()}
  <svg data-testid="filled"></svg>
{/snippet}

<div dir={rtl ? 'rtl' : undefined}>
  <Rating
    aria-label="Rating"
    {value}
    {defaultValue}
    {onValueChange}
    {count}
    {step}
    {variant}
    {orientation}
    {size}
    {hoverable}
    {clearable}
    {disabled}
    {readOnly}
    {name}
    class={className}
    {style}
    icon={customIcon ? { empty, filled } : undefined}
  />
</div>
