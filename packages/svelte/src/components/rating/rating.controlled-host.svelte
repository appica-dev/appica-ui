<script lang="ts">
  import Rating from './rating.svelte'

  let { onValueChange, locked = 2 }: { onValueChange?: (value: number) => void; locked?: number } = $props()
</script>

<Rating aria-label="Rating" value={locked} {onValueChange} />
