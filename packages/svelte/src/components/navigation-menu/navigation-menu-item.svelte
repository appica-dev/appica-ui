<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { NavigationMenu as BitsNavigationMenu } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLLIElement> & {
    /** Stable value for this item. Generated if omitted. */
    value?: string
    children?: Snippet
  }

  let { value, children, ...rest }: Props = $props()
</script>

<BitsNavigationMenu.Item data-slot="navigation-menu-item" {value} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsNavigationMenu.Item>
