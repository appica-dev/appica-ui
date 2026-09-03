<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { NavigationMenu as BitsNavigationMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getNavigationMenuContext, setNavigationMenuContentContext } from './navigation-menu-context'

  const CONTENT_PADDING = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  } as const

  type Props = HTMLAttributes<HTMLDivElement> & {
    keepMounted?: boolean
    children?: Snippet
  }

  let { class: className, keepMounted = false, children, ...rest }: Props = $props()

  const ctx = getNavigationMenuContext()
  setNavigationMenuContentContext(true)

  const classes = $derived(
    cn(
      ctx.morph && [
        'motion-safe:transition-[opacity,translate] motion-safe:duration-350 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]',
        'data-starting-style:motion-safe:opacity-0',
        'data-ending-style:motion-safe:opacity-0',
        'data-[state=closed]:motion-safe:opacity-0',
      ],
      className,
    ),
  )
</script>

<BitsNavigationMenu.Content
  data-slot="navigation-menu-content"
  class={classes}
  forceMount={keepMounted ? true : undefined}
  {...asBitsAttrs(rest)}
>
  <div class={cn('flex w-max flex-col', CONTENT_PADDING[ctx.size])}>
    {@render children?.()}
  </div>
</BitsNavigationMenu.Content>
