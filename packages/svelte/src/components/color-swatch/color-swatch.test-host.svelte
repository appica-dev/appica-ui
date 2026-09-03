<script lang="ts">
  import type { Color } from '../../lib/color'
  import ColorPicker from '../color-picker/color-picker.svelte'
  import ColorSwatch from './color-swatch.svelte'

  let {
    value,
    defaultValue = '#3b82f6',
    disabled = false,
  }: {
    value?: Color | string
    defaultValue?: Color | string
    disabled?: boolean
  } = $props()
</script>

<ColorPicker inline {value} {defaultValue} {disabled} aria-label="Brand color">
  <ColorSwatch data-testid="swatch" />
</ColorPicker>
