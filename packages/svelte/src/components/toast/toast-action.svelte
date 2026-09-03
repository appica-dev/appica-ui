<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import type { VariantProps } from 'class-variance-authority'
  import { cn } from '../../internal/utils'
  import { buttonVariants } from '../button/button-variants'
  import { getToastItemContext } from './toast-item-context'

  type Props = HTMLButtonAttributes & {
    /**
     * Visual style.
     * @default 'primary'
     */
    variant?: VariantProps<typeof buttonVariants>['variant']
    /**
     * Height and padding.
     * @default 'sm'
     */
    size?: VariantProps<typeof buttonVariants>['size']
    children?: Snippet
  }

  let { class: className, variant = 'primary', size = 'sm', children, onclick, ...rest }: Props = $props()

  const item = getToastItemContext()
  const action = $derived(item?.toast.actionProps)
  const label = $derived(action?.children)

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(event)
    action?.onclick?.(event)
    action?.onClick?.(event)
  }
</script>

<button
  type="button"
  data-slot="toast-action"
  class={cn(buttonVariants({ variant, size }), action?.class, className)}
  {...rest}
  id={action?.id ?? rest.id}
  disabled={action?.disabled ?? rest.disabled}
  onclick={handleClick}
>
  {#if children}
    {@render children()}
  {:else}
    {label}
  {/if}
</button>
