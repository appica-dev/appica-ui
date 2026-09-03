<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import {
    setButtonGroupContext,
    type ButtonGroupSize,
    type ButtonGroupVariant,
  } from './button-group-context'

  const OUTLINED_VARIANTS = new Set<ButtonGroupVariant>(['primary-outline', 'outline', 'light'])

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Visual style applied to every child `Button`. Inherited unless a button sets its own `variant`. */
    variant?: ButtonGroupVariant
    /** Height/padding applied to every child `Button`. Inherited unless a button sets its own `size`. */
    size?: ButtonGroupSize
    /**
     * Disables every child `Button`. A child can't re-enable itself; the group's `disabled` wins.
     * @default false
     */
    disabled?: boolean
    /**
     * Lay the buttons out in a row or a column; controls which corners are rounded.
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical'
    children?: Snippet
  }

  let {
    class: className,
    variant,
    size,
    disabled = false,
    orientation = 'horizontal',
    children,
    ...rest
  }: Props = $props()

  setButtonGroupContext({
    get variant() {
      return variant
    },
    get size() {
      return size
    },
    get disabled() {
      return disabled
    },
  })

  const horizontal = $derived(orientation === 'horizontal')
  const isOutlined = $derived(variant != null && OUTLINED_VARIANTS.has(variant))
</script>

<div
  data-slot="button-group"
  role="group"
  class={cn(
    'isolate flex w-fit items-stretch',
    '*:relative *:hover:z-2 *:focus-visible:z-2 *:active:z-2',
    horizontal
      ? [
          '[&>*:not(:first-of-type)]:rounded-s-none [&>*:not(:last-of-type)]:rounded-e-none',
          isOutlined ? '-space-x-(--border-width)' : 'space-x-(--border-width)',
        ]
      : [
          'flex-col',
          '[&>*:not(:first-of-type)]:rounded-t-none [&>*:not(:last-of-type)]:rounded-b-none',
          isOutlined ? '-space-y-(--border-width)' : 'space-y-(--border-width)',
        ],
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
