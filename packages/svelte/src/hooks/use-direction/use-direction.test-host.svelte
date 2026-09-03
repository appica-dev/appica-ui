<script lang="ts">
  import { DirectionProvider } from '../../providers/direction-provider'
  import type { Direction } from '../../providers/direction-provider/direction-context'
  import DirectionRead from './use-direction.test-read.svelte'

  let { dir }: { dir?: Direction } = $props()
</script>

{#if dir}
  <DirectionProvider {dir}>
    <DirectionRead />
  </DirectionProvider>
{:else}
  <DirectionRead />
{/if}
