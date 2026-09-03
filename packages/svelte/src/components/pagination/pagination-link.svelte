<script lang="ts">
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn, focusableProps } from '../../internal/utils'
  import { buttonVariants } from '../button/button-variants'
  import { getPaginationContext, LINK_SIZE_OVERRIDES } from './pagination-context'

  type PaginationLinkEl = 'a' | 'button'

  type Props = HTMLAnchorAttributes &
    HTMLButtonAttributes & {
      /**
       * Mark the current page. Renders a non-interactive, filled link with `aria-current="page"`.
       * @default false
       */
      active?: boolean
      /**
       * Make the link non-interactive and dimmed (`aria-disabled`); used for out-of-range controls.
       * @default false
       */
      disabled?: boolean
      /**
       * Root tag.
       * @default 'a'
       */
      el?: PaginationLinkEl
      children?: Snippet
    }

  let {
    class: className,
    active = false,
    disabled = false,
    el = 'a',
    href,
    children,
    ...rest
  }: Props = $props()

  const ctx = getPaginationContext()
  const variant = $derived(ctx.variant())
  const size = $derived(ctx.size())
  const extra = $derived(focusableProps(disabled))
  const classes = $derived(
    cn(
      buttonVariants({ variant, size }),
      LINK_SIZE_OVERRIDES[size],
      active && 'text-primary-foreground pointer-events-none cursor-default before:bg-primary before:border-transparent',
      disabled && 'opacity-disabled pointer-events-none',
      className,
    ),
  )
</script>

<svelte:element
  this={el}
  data-slot="pagination-link"
  data-active={active ? '' : undefined}
  aria-current={active ? 'page' : undefined}
  href={el === 'a' ? href : undefined}
  type={el === 'button' ? 'button' : undefined}
  class={classes}
  {...extra}
  {...rest}
>
  {@render children?.()}
</svelte:element>
