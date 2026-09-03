<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { ContextMenu as BitsContextMenu } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { children, ...rest }: Props = $props()
</script>

<BitsContextMenu.Group data-slot="context-menu-group" {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsContextMenu.Group>
