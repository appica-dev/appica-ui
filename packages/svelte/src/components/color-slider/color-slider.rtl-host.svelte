<script lang="ts">
  import ColorSlider from './color-slider.svelte'
  import { DirectionProvider } from '../../providers/direction-provider'
  import type { Color, ColorChannel } from '../../lib/color'
  import type { ColorSliderOrientation } from './color-slider.svelte'

  let {
    dir = 'ltr',
    channel = 'hue',
    orientation,
    defaultValue = 'hsb(120, 50%, 50%)',
    onValueChange,
  }: {
    dir?: 'ltr' | 'rtl'
    channel?: ColorChannel
    orientation?: ColorSliderOrientation
    defaultValue?: string
    onValueChange?: (value: Color) => void
  } = $props()
</script>

<DirectionProvider {dir}>
  <ColorSlider data-testid="track" {channel} {orientation} {defaultValue} {onValueChange} />
</DirectionProvider>
