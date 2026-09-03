<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import type { VariantProps } from 'class-variance-authority'
  import { Button as BitsButton } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getButtonGroupContext } from '../button-group/button-group-context'
  import { buttonVariants } from './button-variants'

  type ButtonVariant = VariantProps<typeof buttonVariants>['variant']
  type ButtonSize = VariantProps<typeof buttonVariants>['size']

  type Props = HTMLButtonAttributes & {
    /**
     * Visual style.
     * @default 'primary'
     */
    variant?: ButtonVariant
    /**
     * Height and padding. The `icon-*` sizes are square, for icon-only buttons.
     * @default 'md'
     */
    size?: ButtonSize
    /**
     * Keep the control reachable by keyboard while disabled.
     * @default false
     */
    focusableWhenDisabled?: boolean
    children?: Snippet
  }

  let {
    class: className,
    variant,
    size,
    disabled,
    focusableWhenDisabled = false,
    type = 'button',
    onclick,
    onkeydown,
    onpointerdown,
    children,
    ...rest
  }: Props = $props()

  const group = getButtonGroupContext()
  const resolvedVariant = $derived(variant ?? group?.variant)
  const resolvedSize = $derived(size ?? group?.size)
  const resolvedDisabled = $derived(Boolean(disabled || group?.disabled))
  const classes = $derived(cn(buttonVariants({ variant: resolvedVariant, size: resolvedSize }), className))
  const nativeDisabled = $derived(resolvedDisabled && !focusableWhenDisabled)
  const ariaDisabled = $derived(resolvedDisabled && focusableWhenDisabled ? true : undefined)

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    if (resolvedDisabled) {
      event.preventDefault()
      return
    }
    onclick?.(event)
  }

  function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    if (resolvedDisabled && focusableWhenDisabled && event.key !== 'Tab') {
      event.preventDefault()
    }
    if (resolvedDisabled) return
    onkeydown?.(event)
  }

  function handlePointerdown(event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    if (resolvedDisabled) {
      event.preventDefault()
      return
    }
    onpointerdown?.(event)
  }
</script>

<BitsButton.Root
  data-slot="button"
  data-disabled={resolvedDisabled ? '' : undefined}
  {type}
  disabled={nativeDisabled}
  aria-disabled={ariaDisabled}
  class={classes}
  onclick={handleClick}
  onkeydown={handleKeydown}
  onpointerdown={handlePointerdown}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsButton.Root>
