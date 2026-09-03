<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { NavigationMenu as BitsNavigationMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { navigationLinkVariants } from '../navigation/navigation-link-variants'
  import { getNavigationMenuContext, getNavigationMenuInContent } from './navigation-menu-context'

  type Props = HTMLAnchorAttributes & {
    /** Marks this link as the current page. */
    active?: boolean
    children?: Snippet
  }

  let { class: className, href, active, children, ...rest }: Props = $props()

  const ctx = getNavigationMenuContext()
  const inContent = getNavigationMenuInContent()
  const vertical = $derived(inContent || ctx.orientation === 'vertical')
  const classes = $derived(
    cn(
      navigationLinkVariants({ variant: inContent ? 'pill' : ctx.variant, size: ctx.size }),
      vertical && 'w-full',
      'outline-hidden',
      className,
    ),
  )
</script>

<BitsNavigationMenu.Link
  data-slot="navigation-menu-link"
  data-orientation={vertical ? 'vertical' : 'horizontal'}
  {href}
  {active}
  class={classes}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsNavigationMenu.Link>
