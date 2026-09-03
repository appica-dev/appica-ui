<script lang="ts">
  import ColorArea from './color-area.svelte'
  import { parseColor, type Color } from '../../lib/color'

  let color = $state(parseColor('hsb(0, 50%, 50%)'))
</script>

<ColorArea bind:value={color} xChannel="saturation" yChannel="brightness" />
