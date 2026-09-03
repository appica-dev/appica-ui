<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLButtonAttributes & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<BitsCombobox.Trigger
  data-slot="autocomplete-trigger"
  class={cn(
    'cursor-pointer outline-none',
    'data-disabled:opacity-disabled data-disabled:pointer-events-none data-disabled:cursor-not-allowed',
    className,
  )}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsCombobox.Trigger>
