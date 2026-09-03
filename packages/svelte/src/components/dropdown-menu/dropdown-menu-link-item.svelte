<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { DropdownMenu as BitsDropdownMenu } from 'bits-ui'
  import type { ClassValue } from 'clsx'
  import { cn } from '../../internal/utils'
  import { navigationLinkVariants } from '../navigation/navigation-link-variants'
  import { getDropdownMenuContext } from './dropdown-menu-context'
  import { ITEM_BASE } from './dropdown-menu-variants'

  type Props = HTMLAnchorAttributes & {
    href: string
    disabled?: boolean
    children?: Snippet
  }

  let { class: className, href, disabled, children, ...rest }: Props = $props()

  const ctx = getDropdownMenuContext()
  const classes = $derived(cn(navigationLinkVariants({ variant: 'pill', size: ctx.size }), ITEM_BASE, className))
</script>

<BitsDropdownMenu.Item {disabled}>
  {#snippet child({ props })}
    <a {...props} {href} data-slot="dropdown-menu-link-item" class={cn(props.class as ClassValue, classes)} {...rest}>
      {@render children?.()}
    </a>
  {/snippet}
</BitsDropdownMenu.Item>
