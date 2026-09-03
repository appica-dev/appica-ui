<script lang="ts">
  import ColorPicker from './color-picker.svelte'
  import ColorPickerInput from './color-picker-input.svelte'
  import ColorSlider from '../color-slider/color-slider.svelte'
  import ColorSwatch from '../color-swatch/color-swatch.svelte'
  import ColorSwatchPicker from '../color-swatch-picker/color-swatch-picker.svelte'
  import ColorSwatchPickerItem from '../color-swatch-picker/color-swatch-picker-item.svelte'
  import type { Color, ColorFormat } from '../../lib/color'
  import type { ColorPickerSwatchPosition, ColorPickerVariant } from './color-picker.svelte'

  let {
    inline = false,
    alpha = false,
    eyedropper = false,
    disabled = false,
    defaultValue = '#3b82f6',
    value,
    name,
    label,
    swatchPosition,
    variant,
    open,
    hideTrigger = false,
    keepMounted = false,
    customAnchor = false,
    panel = 'default',
    inputFormat,
    inputSize,
    inputVariant,
    onValueChange,
    onValueCommitted,
    'aria-label': ariaLabel,
  }: {
    inline?: boolean
    alpha?: boolean
    eyedropper?: boolean
    disabled?: boolean
    defaultValue?: string
    value?: Color | string
    name?: string
    label?: string | null
    swatchPosition?: ColorPickerSwatchPosition
    variant?: ColorPickerVariant
    open?: boolean
    hideTrigger?: boolean
    keepMounted?: boolean
    customAnchor?: boolean
    panel?: 'default' | 'hue' | 'shared' | 'locked-palette' | 'input' | 'input-only' | 'input-chrome'
    inputFormat?: ColorFormat
    inputSize?: 'sm' | 'md' | 'lg'
    inputVariant?: 'outline' | 'soft'
    onValueChange?: (value: Color) => void
    onValueCommitted?: (value: Color) => void
    'aria-label'?: string
  } = $props()

  let anchorEl: HTMLDivElement | undefined = $state()

  const pickerProps = $derived({
    inline,
    alpha,
    eyedropper,
    disabled,
    defaultValue,
    value,
    name,
    label,
    swatchPosition,
    variant,
    open,
    onValueChange,
    onValueCommitted,
    'aria-label': ariaLabel,
    'data-testid': 'trigger',
    trigger: hideTrigger ? null : undefined,
    popoverProps:
      keepMounted || customAnchor
        ? { keepMounted, customAnchor: customAnchor ? anchorEl : undefined }
        : undefined,
  })
</script>

{#if customAnchor}
  <div bind:this={anchorEl} data-testid="field-anchor"></div>
{/if}

{#if panel === 'default'}
  <ColorPicker {...pickerProps} />
{:else if panel === 'hue'}
  <ColorPicker {...pickerProps}>
    <ColorSlider channel="hue" />
  </ColorPicker>
{:else if panel === 'shared'}
  <ColorPicker {...pickerProps}>
    <ColorSwatch />
    <ColorSlider channel="hue" />
    <ColorSwatchPicker aria-label="Presets">
      <ColorSwatchPickerItem color="#00ff00" />
    </ColorSwatchPicker>
  </ColorPicker>
{:else if panel === 'locked-palette'}
  <ColorPicker {...pickerProps}>
    <ColorSwatch />
    <ColorSwatchPicker aria-label="Presets" value="#ff0000" onValueChange={() => {}}>
      <ColorSwatchPickerItem color="#00ff00" />
    </ColorSwatchPicker>
  </ColorPicker>
{:else if panel === 'input'}
  <ColorPicker {...pickerProps}>
    <ColorSlider channel="hue" />
    <ColorPickerInput />
  </ColorPicker>
{:else if panel === 'input-only'}
  <ColorPicker {...pickerProps}>
    <ColorPickerInput format={inputFormat} />
  </ColorPicker>
{:else if panel === 'input-chrome'}
  <ColorPicker {...pickerProps}>
    <ColorPickerInput {inputSize} variant={inputVariant} />
  </ColorPicker>
{/if}
