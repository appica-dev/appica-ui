<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { RadioGroup as BitsRadioGroup } from 'bits-ui'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Controlled selected value. Pair with `onValueChange` or `bind:value`. */
    value?: string
    /**
     * Uncontrolled initial selected value.
     * @default ''
     */
    defaultValue?: string
    /** Fires when the selected value changes. */
    onValueChange?: (value: string) => void
    /**
     * Lay options out in a row or column; sets which arrow keys move selection.
     * @default 'vertical'
     */
    orientation?: 'horizontal' | 'vertical'
    /** Field name submitted with a form. */
    name?: string
    /**
     * Disable every radio in the group.
     * @default false
     */
    disabled?: boolean
    children?: Snippet
  }

  let {
    class: className,
    value = $bindable(),
    defaultValue = '',
    onValueChange,
    orientation = 'vertical',
    name,
    disabled,
    id,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedby,
    children,
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
  inner = untrack(() => value ?? defaultValue)
  const horizontal = $derived(orientation === 'horizontal')
  const classes = $derived(cn('flex', horizontal ? 'flex-wrap gap-4' : 'flex-col gap-2', className))

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
</script>

<BitsRadioGroup.Root
  data-slot="radio-group"
  class={classes}
  bind:value={inner}
  {orientation}
  name={control.name}
  disabled={control.disabled}
  id={control.id}
  aria-invalid={control.ariaInvalid}
  aria-describedby={control.describedby}
  aria-orientation={orientation}
  onValueChange={handleValueChange}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsRadioGroup.Root>
