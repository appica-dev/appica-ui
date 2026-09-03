<script lang="ts">
  import CopyButton from './copy-button.svelte'

  let {
    kind = 'input',
  }: {
    kind?: 'input' | 'pre'
  } = $props()

  let node: HTMLElement | undefined = $state()
</script>

{#if kind === 'input'}
  <input bind:this={node} value="from input" aria-label="Source" />
{:else}
  <pre bind:this={node}><code>npm install appica</code></pre>
{/if}

{#if node}
  <CopyButton value={node} />
{/if}
