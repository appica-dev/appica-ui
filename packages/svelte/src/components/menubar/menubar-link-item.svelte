<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Menubar as BitsMenubar } from 'bits-ui'
  import type { ClassValue } from 'clsx'
  import { cn } from '../../internal/utils'
  import { navigationLinkVariants } from '../navigation/navigation-link-variants'
  import { getMenubarContext } from './menubar-context'
  import { ITEM_BASE } from './menubar-variants'

  type Props = HTMLAnchorAttributes & {
    href: string
    disabled?: boolean
    children?: Snippet
  }

  let { class: className, href, disabled, children, ...rest }: Props = $props()

  const ctx = getMenubarContext()
  const classes = $derived(cn(navigationLinkVariants({ variant: 'pill', size: ctx.size }), ITEM_BASE, className))
</script>

<BitsMenubar.Item {disabled}>
  {#snippet child({ props })}
    <a {...props} {href} data-slot="menubar-link-item" class={cn(props.class as ClassValue, classes)} {...rest}>
      {@render children?.()}
    </a>
  {/snippet}
</BitsMenubar.Item>
