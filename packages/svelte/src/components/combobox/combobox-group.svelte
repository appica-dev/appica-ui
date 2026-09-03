<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { children, ...rest }: Props = $props()
</script>

<BitsCombobox.Group data-slot="combobox-group" {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsCombobox.Group>
