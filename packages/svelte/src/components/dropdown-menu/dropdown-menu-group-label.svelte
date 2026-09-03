<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { DropdownMenu as BitsDropdownMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getDropdownMenuContext } from './dropdown-menu-context'
  import { GROUP_LABEL_SIZE } from './dropdown-menu-variants'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getDropdownMenuContext()
</script>

<BitsDropdownMenu.GroupHeading
  data-slot="dropdown-menu-group-label"
  class={cn('text-foreground-subtle', GROUP_LABEL_SIZE[ctx.size], className)}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsDropdownMenu.GroupHeading>
