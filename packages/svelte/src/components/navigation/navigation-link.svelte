<script lang="ts">
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn, focusableProps } from '../../internal/utils'
  import { navigationLinkVariants } from './navigation-link-variants'
  import {
    getNavigationContext,
    type NavigationActiveLink,
    type NavigationOrientation,
    type NavigationSize,
    type NavigationVariant,
  } from './navigation-context'

  type NavigationLinkEl = 'a' | 'button'

  type Props = HTMLAnchorAttributes &
    HTMLButtonAttributes & {
      /**
       * Override the root's variant for this link.
       * @default root
       */
      variant?: NavigationVariant
      /**
       * Override the root's size for this link.
       * @default root
       */
      size?: NavigationSize
      /**
       * Override the root's orientation for this link.
       * @default root
       */
      orientation?: NavigationOrientation
      /** Force the active state, overriding `activeLink`. */
      active?: boolean
      /**
       * Dim the link and remove it from the tab order.
       * @default false
       */
      disabled?: boolean
      /** Matched against the root's `activeLink` to mark this link current. */
      value?: Exclude<NavigationActiveLink, null>
      /**
       * Custom marker for the `indicator` variant.
       * @default chevron
       */
      indicator?: Snippet
      /**
       * Root tag.
       * @default 'a'
       */
      el?: NavigationLinkEl
      children?: Snippet
    }

  let {
    class: className,
    variant: variantProp,
    size: sizeProp,
    orientation: orientationProp,
    active: activeProp,
    disabled = false,
    value,
    indicator,
    el = 'a',
    href,
    children,
    ...rest
  }: Props = $props()

  const ctx = getNavigationContext()
  const variant = $derived(variantProp ?? ctx?.variant() ?? 'pill')
  const size = $derived(sizeProp ?? ctx?.size() ?? 'md')
  const orientation = $derived(orientationProp ?? ctx?.orientation() ?? 'horizontal')
  const active = $derived(activeProp ?? (value !== undefined && ctx?.activeLink() === value))
  const extra = $derived(focusableProps(disabled))
  const classes = $derived(cn(navigationLinkVariants({ variant, size }), className))
</script>

<svelte:element
  this={el}
  data-slot="navigation-link"
  data-orientation={orientation}
  data-active={active ? '' : undefined}
  aria-current={active ? 'page' : undefined}
  href={el === 'a' ? href : undefined}
  type={el === 'button' ? 'button' : undefined}
  class={classes}
  {...extra}
  {...rest}
>
  {#if variant === 'indicator'}
    <span data-slot="navigation-link-indicator" aria-hidden="true">
      {#if indicator}
        {@render indicator()}
      {:else}
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path
            d="M5.558 3.558c.244-.244.641-.244.885 0l4 4c.244.244.244.641 0 .885l-4 4c-.244.244-.641.244-.885 0s-.244-.641 0-.885L9.115 8 5.558 4.442c-.244-.244-.244-.641 0-.885z"
          />
        </svg>
      {/if}
    </span>
    <span data-slot="navigation-link-label">{@render children?.()}</span>
  {:else}
    {@render children?.()}
  {/if}
</svelte:element>
