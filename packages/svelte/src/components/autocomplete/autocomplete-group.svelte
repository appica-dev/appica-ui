<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'
  import { setAutocompleteGroupContext } from './autocomplete-context'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** The group's items, so the inner AutocompleteCollection can map them. */
    items?: readonly unknown[]
    children?: Snippet
  }

  let { items = [], children, ...rest }: Props = $props()

  setAutocompleteGroupContext({
    items: () => items,
  })
</script>

<BitsCombobox.Group data-slot="autocomplete-group" {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsCombobox.Group>
