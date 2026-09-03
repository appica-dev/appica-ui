<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { PinInput as BitsPinInput } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { inputVariants } from '../input/input-variants'
  import { getOTPFieldContext, type OTPFieldCell } from './otp-field-context'

  const INPUT_SQUARE = {
    sm: 'w-8',
    md: 'w-10',
    lg: 'w-12',
  } as const

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Cell object from the `OTPField` children snippet. */
    cell: OTPFieldCell
    children?: Snippet
  }

  let { class: className, cell, children, ...rest }: Props = $props()

  const ctx = getOTPFieldContext()
  const classes = $derived(
    cn(
      inputVariants({ variant: ctx.variant, size: ctx.size, state: 'self' }),
      'relative flex items-center justify-center px-0 text-center',
      INPUT_SQUARE[ctx.size],
      className,
    ),
  )
</script>

<BitsPinInput.Cell
  data-slot="otp-field-input"
  {cell}
  class={classes}
  data-invalid={ctx.invalid ? '' : undefined}
  {...asBitsAttrs(rest)}
>
  {#if children}
    {@render children()}
  {:else}
    {cell.char ?? ''}
    {#if cell.hasFakeCaret}
      <span
        data-slot="otp-field-caret"
        class="bg-foreground pointer-events-none absolute inset-y-2 start-1/2 w-px -translate-x-1/2 animate-pulse"
        aria-hidden="true"
      ></span>
    {/if}
  {/if}
</BitsPinInput.Cell>
