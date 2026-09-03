<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { PinInput as BitsPinInput } from 'bits-ui'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import {
    setOTPFieldContext,
    type OTPFieldCell,
    type OTPFieldSize,
    type OTPFieldVariant,
  } from './otp-field-context'

  type CellSnippetProps = {
    cells: OTPFieldCell[]
    isFocused: boolean
    isHovering: boolean
  }

  type Props = Omit<HTMLInputAttributes, 'size' | 'value' | 'children'> & {
    /**
     * Slot appearance - bordered or filled.
     * @default 'outline'
     */
    variant?: OTPFieldVariant
    /**
     * Scales every slot.
     * @default 'md'
     */
    size?: OTPFieldSize
    /**
     * Number of character slots. Maps to bits-ui PinInput `maxlength`.
     */
    length: number
    /** Controlled value. Pair with `onValueChange` or `bind:value`. */
    value?: string
    /** Uncontrolled initial value. */
    defaultValue?: string
    /** Fires when the value changes. */
    onValueChange?: (value: string) => void
    /** Fires when every slot is filled. */
    onComplete?: (value: string) => void
    children?: Snippet<[CellSnippetProps]>
  }

  let {
    class: className,
    variant = 'outline',
    size = 'md',
    length,
    value = $bindable(),
    defaultValue,
    onValueChange,
    onComplete,
    disabled,
    id,
    name,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedby,
    'aria-label': ariaLabel,
    children: slots,
    ...rest
  }: Props = $props()

  const field = getFieldContext()
  const control = $derived(
    mergeFieldControl({
      field,
      id,
      name,
      disabled,
      ariaInvalid,
      ariaDescribedby,
    }),
  )

  let inner = $state('')
  inner = untrack(() => value ?? defaultValue ?? '')

  $effect(() => {
    if (value !== undefined) inner = value
  })

  function handleValueChange(next: string) {
    field?.clearFormError()
    commitBindableChange({
      next,
      bound: value,
      setBound: (nextValue) => {
        value = nextValue
      },
      setInner: (nextValue) => {
        inner = nextValue
      },
      onChange: onValueChange,
    })
  }

  function handleComplete() {
    onComplete?.(inner)
  }

  setOTPFieldContext({
    get variant() {
      return variant
    },
    get size() {
      return size
    },
    get invalid() {
      return control.invalid
    },
  })
</script>

<BitsPinInput.Root
  data-slot="otp-field"
  class={cn('flex w-fit items-center gap-1', className)}
  maxlength={length}
  bind:value={inner}
  onValueChange={handleValueChange}
  onComplete={handleComplete}
  disabled={control.disabled}
  name={control.name}
  inputId={control.id}
  aria-invalid={control.ariaInvalid}
  aria-describedby={control.describedby}
  aria-label={ariaLabel}
  data-invalid={control.invalid ? '' : undefined}
  textalign="center"
  {...asBitsAttrs(rest)}
>
  {#snippet children({ cells, isFocused, isHovering })}
    {@render slots?.({ cells, isFocused, isHovering })}
  {/snippet}
</BitsPinInput.Root>
