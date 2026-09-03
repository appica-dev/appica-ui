<script lang="ts">
  import ColorArea from './color-area.svelte'
  import { DirectionProvider } from '../../providers/direction-provider'
  import type { Color, ColorChannel } from '../../lib/color'

  let {
    dir = 'rtl',
    defaultValue = 'hsb(0, 50%, 50%)',
    xChannel = 'saturation',
    yChannel = 'brightness',
    onValueChange,
  }: {
    dir?: 'ltr' | 'rtl'
    defaultValue?: string
    xChannel?: ColorChannel
    yChannel?: ColorChannel
    onValueChange?: (value: Color) => void
  } = $props()
</script>

<DirectionProvider {dir}>
  <ColorArea {defaultValue} {xChannel} {yChannel} {onValueChange} />
</DirectionProvider>
