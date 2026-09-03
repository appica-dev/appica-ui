<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { NavigationMenu as BitsNavigationMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getNavigationMenuContext } from './navigation-menu-context'

  const HORIZONTAL_GAP: Partial<Record<'pill' | 'line', string>> = {
    pill: 'gap-0.5',
    line: 'gap-7',
  }

  const VERTICAL_GAP: Partial<Record<'pill' | 'line', string>> = {
    pill: 'gap-0.5',
  }

  type Props = HTMLAttributes<HTMLUListElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getNavigationMenuContext()
  const vertical = $derived(ctx.orientation === 'vertical')
  const gap = $derived((vertical ? VERTICAL_GAP : HORIZONTAL_GAP)[ctx.variant])
</script>

<BitsNavigationMenu.List
  data-slot="navigation-menu-list"
  class={cn('flex', vertical ? 'w-full flex-col' : 'w-fit items-center', gap, className)}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsNavigationMenu.List>
