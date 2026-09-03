<script lang="ts">
  import { useToastManager } from './toast-manager.svelte'

  const manager = useToastManager()

  function show() {
    manager.add({
      title: 'Hello',
      timeout: 0,
      data: { icon: customIcon },
    })
  }
</script>

{#snippet customIcon()}
  <span data-testid="custom-icon">!</span>
{/snippet}

<button type="button" onclick={show}>Show toast</button>
