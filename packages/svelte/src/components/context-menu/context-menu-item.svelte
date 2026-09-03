<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { ContextMenu as BitsContextMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { navigationLinkVariants } from '../navigation/navigation-link-variants'
  import { getContextMenuContext } from './context-menu-context'
  import { ITEM_BASE } from './context-menu-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** When `true`, the item cannot be selected. */
    disabled?: boolean
    children?: Snippet
  }

  let { class: className, disabled, children, ...rest }: Props = $props()

  const ctx = getContextMenuContext()
  const classes = $derived(cn(navigationLinkVariants({ variant: 'pill', size: ctx.size }), ITEM_BASE, className))
</script>

<BitsContextMenu.Item data-slot="context-menu-item" {disabled} class={classes} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsContextMenu.Item>
