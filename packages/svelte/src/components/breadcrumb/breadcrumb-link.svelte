<script lang="ts">
  import type { HTMLAnchorAttributes, HTMLButtonAttributes, HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn, focusableProps } from '../../internal/utils'

  type BreadcrumbLinkEl = 'a' | 'button'

  type Props = HTMLAnchorAttributes &
    HTMLButtonAttributes &
    HTMLAttributes<HTMLSpanElement> & {
      /**
       * Mark the current page. Renders a non-interactive `<span>` with `aria-current="page"`.
       * @default false
       */
      active?: boolean
      /**
       * Make the link non-interactive and dimmed.
       * @default false
       */
      disabled?: boolean
      /**
       * Root tag when the link is not `active`.
       * @default 'a'
       */
      el?: BreadcrumbLinkEl
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

  const tag = $derived(active ? 'span' : el)
  const extra = $derived(focusableProps(active || disabled))
  const classes = $derived(
    cn(
      'inline-flex items-center gap-1.5 outline-ring',
      'transition duration-250 motion-reduce:transition-none',
      active
        ? 'text-foreground-intense pointer-events-none'
        : 'hover:text-foreground-intense ease-[cubic-bezier(0.175,0.885,0.32,1.5)] active:scale-[0.97] active:duration-100 active:ease-in-out active:translate-y-px',
      disabled && 'opacity-disabled pointer-events-none',
      className,
    ),
  )
</script>

<svelte:element
  this={tag}
  data-slot="breadcrumb-link"
  data-active={active ? '' : undefined}
  aria-current={active ? 'page' : undefined}
  href={tag === 'a' ? href : undefined}
  type={tag === 'button' ? 'button' : undefined}
  class={classes}
  {...extra}
  {...rest}
>
  {@render children?.()}
</svelte:element>
