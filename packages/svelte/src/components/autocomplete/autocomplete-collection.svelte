<script lang="ts">
  import type { Snippet } from 'svelte'
  import { getAutocompleteGroupContext } from './autocomplete-context'
  import { itemKey } from './autocomplete-filter'

  type Props = {
    children?: Snippet<[item: unknown, index: number]>
  }

  let { children }: Props = $props()

  const group = getAutocompleteGroupContext()
  const items = $derived(group.items())
</script>

{#each items as item, index (itemKey(item, index))}
  {@render children?.(item, index)}
{/each}
