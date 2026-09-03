<script lang="ts">
  import Slider from './slider.svelte'

  let { onValueChange, locked = 30 }: { onValueChange?: (value: number | number[]) => void; locked?: number } =
    $props()
</script>

<Slider value={locked} {onValueChange} thumbAriaLabel="Volume" />
