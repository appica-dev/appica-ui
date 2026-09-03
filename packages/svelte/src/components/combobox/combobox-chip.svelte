<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { buttonVariants } from '../button/button-variants'
  import { getComboboxContext } from './combobox-context'

  const CHIP_SIZE = {
    sm: 'h-6 px-2 text-xs rounded-xs gap-1',
    md: 'h-8 px-3 text-sm rounded-sm gap-1.5',
    lg: 'h-10 px-3.5 text-base rounded-md gap-1.5',
  } as const

  const CHIP_BUTTON_VARIANT = {
    outline: 'soft',
    soft: 'outline',
  } as const

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** Value this chip represents. Removing it updates the root selection. */
    value: string
    children?: Snippet
  }

  let { class: className, value, children, ...rest }: Props = $props()

  const ctx = getComboboxContext()
</script>

<span
  data-slot="combobox-chip"
  class={cn(
    buttonVariants({ variant: CHIP_BUTTON_VARIANT[ctx.variant], size: ctx.size }),
    CHIP_SIZE[ctx.size],
    'text-foreground-strong cursor-default font-normal',
    className,
  )}
  {...rest}
>
  <span class="min-w-0 truncate">{@render children?.()}</span>
  <button
    type="button"
    data-slot="combobox-chip-remove"
    aria-label="Remove"
    class="text-foreground-subtle hover:text-foreground -me-0.5 shrink-0 cursor-pointer transition-colors duration-200 outline-none motion-reduce:transition-none"
    onclick={(event) => {
      event.preventDefault()
      ctx.remove(value)
    }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" fill="currentColor" aria-hidden="true" class="size-[1em]">
      <path
        d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
      />
    </svg>
  </button>
</span>
