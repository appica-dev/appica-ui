<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { NavigationMenu as BitsNavigationMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { setNavigationMenuContext, getNavigationMenuContext } from './navigation-menu-context'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const parent = getNavigationMenuContext()
  setNavigationMenuContext({
    get variant(): 'pill' {
      return 'pill'
    },
    get size() {
      return parent.size
    },
    get icon() {
      return parent.icon
    },
    get orientation(): 'vertical' {
      return 'vertical'
    },
    get backdrop() {
      return false
    },
    get morph() {
      return parent.morph
    },
    isOpen: () => parent.isOpen(),
  })
</script>

<BitsNavigationMenu.Sub data-slot="navigation-menu-sub" orientation="vertical" class={cn(className)} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsNavigationMenu.Sub>
