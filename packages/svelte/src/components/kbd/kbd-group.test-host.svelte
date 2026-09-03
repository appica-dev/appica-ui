<script lang="ts">
  import Kbd from './kbd.svelte'
  import KbdGroup from './kbd-group.svelte'
  import type { KbdSize } from './kbd-context'

  let {
    size,
    class: className,
    overrideSize,
    passthrough = false,
  }: {
    size?: KbdSize
    class?: string
    overrideSize?: KbdSize
    passthrough?: boolean
  } = $props()
</script>

<KbdGroup {size} class={className}>
  {#if passthrough}
    <span data-testid="plus">+</span>
  {/if}
  {#if overrideSize}
    <Kbd size={overrideSize} data-testid="overridden">⌘</Kbd>
    <Kbd data-testid="inherits">K</Kbd>
  {:else}
    <Kbd data-testid="a">⌘</Kbd>
    <Kbd data-testid="b">K</Kbd>
  {/if}
</KbdGroup>
