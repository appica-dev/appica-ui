<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { DropdownMenu as BitsDropdownMenu } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { children, ...rest }: Props = $props()
</script>

<BitsDropdownMenu.Group data-slot="dropdown-menu-group" {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsDropdownMenu.Group>
