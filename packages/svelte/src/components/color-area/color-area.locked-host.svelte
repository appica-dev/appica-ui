<script lang="ts">
  import ColorArea from './color-area.svelte'
  import type { Color } from '../../lib/color'

  let { onValueChange }: { onValueChange?: (value: Color) => void } = $props()
</script>

<ColorArea value="hsb(0, 50%, 50%)" xChannel="saturation" yChannel="brightness" {onValueChange} />
