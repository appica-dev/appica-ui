<script lang="ts">
  import ColorSlider from './color-slider.svelte'
  import type { Color } from '../../lib/color'
  import type { ColorSliderOrientation } from './color-slider.svelte'

  let {
    value,
    orientation,
    channel = 'saturation',
  }: {
    value: Color | string
    orientation?: ColorSliderOrientation
    channel?: 'saturation' | 'hue'
  } = $props()
</script>

<ColorSlider data-testid="track" {channel} {value} {orientation} />
