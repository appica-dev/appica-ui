<script lang="ts">
  import type { HTMLAnchorAttributes, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn, focusableProps } from '../../internal/utils'
  import { badgeVariants, type BadgeSize, type BadgeVariant } from './badge-variants'

  type Props = HTMLAttributes<HTMLSpanElement> &
    HTMLAnchorAttributes &
    HTMLButtonAttributes & {
      /**
       * Color scheme.
       * @default 'primary'
       */
      variant?: BadgeVariant
      /**
       * Scale. The `icon-*` sizes render a square badge for a lone icon.
       * @default 'md'
       */
      size?: BadgeSize
      children?: Snippet
    }

  let { class: className, variant, size, href, onclick, children, ...rest }: Props = $props()

  const interactive = $derived(href != null || onclick != null)
  const classes = $derived(cn(badgeVariants({ variant, size }), className))
  const extra = $derived(interactive ? focusableProps() : {})
</script>

{#if href}
  <a data-slot="badge" {href} class={classes} {onclick} {...extra} {...rest}>
    {@render children?.()}
  </a>
{:else if onclick}
  <button type="button" data-slot="badge" class={classes} {onclick} {...extra} {...rest}>
    {@render children?.()}
  </button>
{:else}
  <span data-slot="badge" class={classes} {...rest}>
    {@render children?.()}
  </span>
{/if}
