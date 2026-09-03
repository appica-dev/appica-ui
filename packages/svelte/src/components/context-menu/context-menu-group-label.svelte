<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { ContextMenu as BitsContextMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getContextMenuContext } from './context-menu-context'
  import { GROUP_LABEL_SIZE } from './context-menu-variants'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getContextMenuContext()
</script>

<BitsContextMenu.GroupHeading
  data-slot="context-menu-group-label"
  class={cn('text-foreground-subtle', GROUP_LABEL_SIZE[ctx.size], className)}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsContextMenu.GroupHeading>
