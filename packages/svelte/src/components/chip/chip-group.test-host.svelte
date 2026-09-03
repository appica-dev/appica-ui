<script lang="ts">
  import Chip from './chip.svelte'
  import ChipGroup from './chip-group.svelte'
  import type { ChipSize, ChipVariant } from './chip-variants'

  type Item = {
    label: string
    dismissible?: boolean
    size?: ChipSize
    onDismiss?: () => void
  }

  let {
    variant,
    size,
    items,
    class: className,
  }: {
    variant?: ChipVariant
    size?: ChipSize
    items: Item[]
    class?: string
  } = $props()

  let group: { clearAll: () => void } | undefined = $state()

  export function clearAll() {
    group?.clearAll()
  }
</script>

<ChipGroup bind:this={group} {variant} {size} class={className}>
  {#each items as item (item.label)}
    <Chip dismissible={item.dismissible} size={item.size} onDismiss={item.onDismiss}>{item.label}</Chip>
  {/each}
</ChipGroup>
