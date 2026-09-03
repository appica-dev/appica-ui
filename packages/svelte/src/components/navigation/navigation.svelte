<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import {
    setNavigationContext,
    type NavigationActiveLink,
    type NavigationOrientation,
    type NavigationSize,
    type NavigationVariant,
  } from './navigation-context'

  type NavigationBaseProps = Omit<HTMLAttributes<HTMLElement>, 'aria-orientation'> & {
    /**
     * Scales link text, padding, and icons.
     * @default 'md'
     */
    size?: NavigationSize
    /**
     * The `value` of the current link. Stamps the match with `aria-current="page"`.
     * @default null
     */
    activeLink?: NavigationActiveLink
    children?: Snippet
  }

  type Props = NavigationBaseProps &
    (
      | {
          /** Lay the links out as a row or a column. @default 'horizontal' */
          orientation?: 'horizontal'
          /** Active/hover styling. `indicator` is vertical-only. @default 'pill' */
          variant?: Extract<NavigationVariant, 'pill' | 'line'>
        }
      | {
          /** Lay the links out as a row or a column. @default 'horizontal' */
          orientation: 'vertical'
          /** Active/hover styling. `indicator` is vertical-only. @default 'pill' */
          variant?: Extract<NavigationVariant, 'pill' | 'line' | 'indicator'>
        }
    )

  let {
    class: className,
    orientation = 'horizontal',
    variant = 'pill',
    size = 'md',
    activeLink = null,
    children,
    ...rest
  }: Props = $props()

  setNavigationContext({
    orientation: () => orientation,
    variant: () => variant as NavigationVariant,
    size: () => size,
    activeLink: () => activeLink,
  })
</script>

<nav data-slot="navigation" data-orientation={orientation} class={className} {...rest}>
  {@render children?.()}
</nav>
