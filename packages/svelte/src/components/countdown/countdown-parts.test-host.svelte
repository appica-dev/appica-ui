<script lang="ts">
  import Countdown from './countdown.svelte'

  let { duration = 5 }: { duration?: number } = $props()
</script>

<Countdown {duration}>
  {#snippet children(parts)}
    <span>{parts.seconds}s left</span>
  {/snippet}
</Countdown>
