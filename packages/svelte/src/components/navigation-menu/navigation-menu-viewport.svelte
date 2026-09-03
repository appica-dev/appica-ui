<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { NavigationMenu as BitsNavigationMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getNavigationMenuContext } from './navigation-menu-context'

  const POPUP_RADIUS = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
  } as const

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getNavigationMenuContext()
  const vertical = $derived(ctx.orientation === 'vertical')
</script>

{#if ctx.backdrop && ctx.isOpen()}
  <div
    data-slot="navigation-menu-backdrop"
    class={cn(
      'pointer-events-none fixed inset-0 z-40 bg-black/30 backdrop-blur-sm',
      'motion-safe:transition-opacity motion-safe:duration-250 motion-safe:ease-out',
      'in-data-[state=closed]:motion-safe:opacity-0',
    )}
  ></div>
{/if}

<div
  data-slot="navigation-menu-positioner"
  class={cn('isolate z-50', vertical && 'ms-2')}
>
  <BitsNavigationMenu.Viewport {...asBitsAttrs(rest)}>
    {#snippet child({ props })}
      {@const bitsClass = typeof props.class === 'string' ? props.class : ''}
      <div
        {...props}
        data-slot="navigation-menu-popup"
        class={cn(
          bitsClass,
          'bg-background border-border-overlay relative overflow-hidden border shadow-2xl outline-none',
          POPUP_RADIUS[ctx.size],
          ctx.morph &&
            'h-(--bits-navigation-menu-viewport-height) w-(--bits-navigation-menu-viewport-width)',
          ctx.morph
            ? 'motion-safe:[transition:opacity_300ms_cubic-bezier(0.175,0.885,0.32,1.5),scale_300ms_cubic-bezier(0.175,0.885,0.32,1.5),width_300ms_cubic-bezier(0.22,1,0.36,1),height_300ms_cubic-bezier(0.22,1,0.36,1)]'
            : 'motion-safe:transition-[opacity,scale] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
          className,
        )}
      >
        {@render children?.()}
      </div>
    {/snippet}
  </BitsNavigationMenu.Viewport>
</div>
