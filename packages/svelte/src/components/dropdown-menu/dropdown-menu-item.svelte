<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { DropdownMenu as BitsDropdownMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { navigationLinkVariants } from '../navigation/navigation-link-variants'
  import { getDropdownMenuContext } from './dropdown-menu-context'
  import { ITEM_BASE } from './dropdown-menu-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** When `true`, the item cannot be selected. */
    disabled?: boolean
    children?: Snippet
  }

  let { class: className, disabled, children, ...rest }: Props = $props()

  const ctx = getDropdownMenuContext()
  const classes = $derived(cn(navigationLinkVariants({ variant: 'pill', size: ctx.size }), ITEM_BASE, className))
</script>

<BitsDropdownMenu.Item data-slot="dropdown-menu-item" {disabled} class={classes} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsDropdownMenu.Item>
