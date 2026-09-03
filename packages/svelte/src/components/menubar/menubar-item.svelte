<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Menubar as BitsMenubar } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { navigationLinkVariants } from '../navigation/navigation-link-variants'
  import { getMenubarContext } from './menubar-context'
  import { ITEM_BASE } from './menubar-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** When `true`, the item cannot be selected. */
    disabled?: boolean
    children?: Snippet
  }

  let { class: className, disabled, children, ...rest }: Props = $props()

  const ctx = getMenubarContext()
  const classes = $derived(cn(navigationLinkVariants({ variant: 'pill', size: ctx.size }), ITEM_BASE, className))
</script>

<BitsMenubar.Item data-slot="menubar-item" {disabled} class={classes} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsMenubar.Item>
