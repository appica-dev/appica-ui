<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Menubar as BitsMenubar } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { navigationLinkVariants } from '../navigation/navigation-link-variants'
  import { getMenubarContext } from './menubar-context'

  type Props = HTMLButtonAttributes & { children?: Snippet }

  let { class: className, disabled, children, ...rest }: Props = $props()

  const ctx = getMenubarContext()
  const classes = $derived(
    cn(navigationLinkVariants({ variant: ctx.variant, size: ctx.size }), 'outline-hidden', className),
  )
</script>

<BitsMenubar.Trigger
  data-slot="menubar-trigger"
  data-orientation={ctx.orientation}
  {disabled}
  class={classes}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsMenubar.Trigger>
