<script lang="ts">
  import ColorSwatchPicker from './color-swatch-picker.svelte'
  import ColorSwatchPickerItem from './color-swatch-picker-item.svelte'
  import { DirectionProvider } from '../../providers/direction-provider'
  import type { Color } from '../../lib/color'
  import type { ColorSwatchPickerLayout, ColorSwatchPickerSize } from './color-swatch-picker-variants'

  let {
    palette = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'],
    value,
    defaultValue,
    onValueChange,
    layout,
    size,
    disabled,
    dir,
    named,
    skipSecond,
  }: {
    palette?: string[]
    value?: Color | string
    defaultValue?: Color | string
    onValueChange?: (value: Color) => void
    layout?: ColorSwatchPickerLayout
    size?: ColorSwatchPickerSize | number
    disabled?: boolean
    dir?: 'ltr' | 'rtl'
    named?: boolean
    skipSecond?: boolean
  } = $props()
</script>

{#snippet picker()}
  <ColorSwatchPicker aria-label="Brand color" {value} {defaultValue} {onValueChange} {layout} {size} {disabled}>
    {#each palette as color, index (color)}
      <ColorSwatchPickerItem
        {color}
        colorName={named && index === 1 ? 'Fire truck red' : undefined}
        disabled={skipSecond && index === 1}
      />
    {/each}
  </ColorSwatchPicker>
{/snippet}

{#if dir}
  <DirectionProvider {dir}>
    {@render picker()}
  </DirectionProvider>
{:else}
  {@render picker()}
{/if}
