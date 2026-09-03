<script lang="ts">
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn, focusableProps } from '../../internal/utils'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { buttonVariants } from '../button/button-variants'
  import { getChipGroupContext } from './chip-context'
  import { chipSizeVariants, closeIconSize, type ChipSize, type ChipVariant } from './chip-variants'

  type Props = HTMLButtonAttributes &
    HTMLAnchorAttributes & {
      /**
       * Visual style, from the shared Button palette. Inherited from `ChipGroup`.
       * @default 'soft'
       */
      variant?: ChipVariant
      /**
       * Height, padding, text, and icon size. Inherited from `ChipGroup`.
       * @default 'md'
       */
      size?: ChipSize
      /**
       * Render a close button; clicking the chip dismisses it with an exit animation.
       * @default false
       */
      dismissible?: boolean
      /**
       * Controlled visibility for a dismissible chip - pair with `onOpenChange`.
       */
      open?: boolean
      /** Fires with `false` the moment a dismiss is requested. */
      onOpenChange?: (open: boolean) => void
      /** Fires once the exit animation finishes. */
      onDismiss?: () => void
      /**
       * Accessible label for the dismiss action (rendered as `sr-only` text).
       * @default 'Dismiss'
       */
      closeLabel?: string
      href?: string
      children?: Snippet
    }

  let {
    class: className,
    variant,
    size,
    dismissible = false,
    open,
    onOpenChange,
    onDismiss,
    closeLabel = 'Dismiss',
    href,
    children,
    onclick,
    disabled,
    ...rest
  }: Props = $props()

  const group = getChipGroupContext()
  const resolvedVariant = $derived((variant ?? group?.variant ?? 'soft') as ChipVariant)
  const resolvedSize = $derived((size ?? group?.size ?? 'md') as ChipSize)
  const reduced = useReducedMotion()
  let internalOpen = $state(true)
  const isControlled = $derived(open !== undefined)
  const actualOpen = $derived(isControlled ? Boolean(open) : internalOpen)

  function triggerDismiss() {
    if (!isControlled) internalOpen = false
    onOpenChange?.(false)
  }

  $effect(() => {
    if (!group || !dismissible) return
    return group.register(triggerDismiss)
  })

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
    onclick?.(event as Parameters<NonNullable<typeof onclick>>[0])
    if (event.defaultPrevented) return
    if (dismissible) triggerDismiss()
  }

  function dismissTransition(_node: Element) {
    const skip = reduced.current
    return {
      duration: skip ? 0 : 280,
      css: (t: number) => {
        const u = 1 - t
        return `opacity: ${t}; transform: scale(${0.85 + 0.15 * t}); filter: blur(${8 * u}px)`
      },
    }
  }

  function handleOutroEnd() {
    onDismiss?.()
  }

  const classes = $derived(
    cn(
      buttonVariants({ variant: resolvedVariant }),
      chipSizeVariants({ size: resolvedSize }),
      dismissible && 'group/chip',
      className,
    ),
  )
  const extra = $derived(focusableProps(Boolean(disabled)))
</script>

{#snippet body()}
  {@render children?.()}
  {#if dismissible}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      data-slot="chip-close-icon"
      data-icon="end"
      class={cn(
        closeIconSize[resolvedSize],
        'opacity-60 transition-opacity duration-200 group-hover/chip:opacity-100 motion-reduce:transition-none',
      )}
    >
      <path
        d="M11.523 3.522c.264-.264.691-.264.955 0s.264.691 0 .955L8.955 8l3.522 3.522c.264.264.264.691 0 .955s-.691.264-.955 0L8 8.955l-3.522 3.522c-.264.264-.691.264-.955 0s-.264-.691 0-.955L7.045 8 3.522 4.478c-.264-.264-.264-.691 0-.955s.691-.264.955 0L8 7.045l3.523-3.522z"
      />
    </svg>
    <span class="sr-only">{closeLabel}</span>
  {/if}
{/snippet}

{#if !dismissible || actualOpen}
  <span class="inline-flex align-middle" out:dismissTransition onoutroend={handleOutroEnd}>
    {#if href}
      <a
        data-slot="chip"
        data-dismissible={dismissible || undefined}
        {href}
        class={classes}
        onclick={handleClick}
        {...extra}
        {...rest}
      >
        {@render body()}
      </a>
    {:else}
      <button
        type="button"
        data-slot="chip"
        data-dismissible={dismissible || undefined}
        {disabled}
        class={classes}
        onclick={handleClick}
        {...extra}
        {...rest}
      >
        {@render body()}
      </button>
    {/if}
  </span>
{/if}
