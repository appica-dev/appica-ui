<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { Select as BitsSelect } from 'bits-ui'
  import { asBitsAttrs, commitBindableChange } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import { setSelectContext, type SelectSize, type SelectVariant } from './select-context'

  type Props = {
    /** Controlled value. A string when single-select, an array when `multiple`. */
    value?: string | string[]
    /** Uncontrolled initial value. */
    defaultValue?: string | string[]
    /** Fires when the selected value(s) change. */
    onValueChange?: (value: string | string[]) => void
    /**
     * Trigger height, popup radius, and item sizing.
     * @default 'md'
     */
    size?: SelectSize
    /**
     * Trigger appearance - bordered or filled.
     * @default 'outline'
     */
    variant?: SelectVariant
    /**
     * Overlay the selected item over the trigger on open. Set `false` when using a `start` snippet.
     * @default true
     */
    alignItemWithTrigger?: boolean
    /**
     * Allow several items to stay selected.
     * @default false
     */
    multiple?: boolean
    /** Field name submitted with a form, via a hidden input. */
    name?: string
    disabled?: boolean
    children?: Snippet
  }

  let {
    value = $bindable(),
    defaultValue,
    onValueChange,
    size = 'md',
    variant = 'outline',
    alignItemWithTrigger = true,
    multiple = false,
    name,
    disabled,
    children,
    ...rest
  }: Props = $props()

  const field = getFieldContext()
  const control = $derived(mergeFieldControl({ field, name, disabled, omitId: true }))

  function toSingle(next: string | string[] | undefined): string {
    if (next == null) return ''
    return Array.isArray(next) ? (next[0] ?? '') : next
  }

  function toMultiple(next: string | string[] | undefined): string[] {
    if (next == null) return []
    return Array.isArray(next) ? next : [next]
  }

  let innerSingle = $state('')
  let innerMultiple = $state<string[]>([])
  innerSingle = untrack(() => toSingle(value ?? defaultValue))
  innerMultiple = untrack(() => toMultiple(value ?? defaultValue))

  $effect(() => {
    if (value === undefined) return
    if (multiple) innerMultiple = toMultiple(value)
    else innerSingle = toSingle(value)
  })

  function handleSingleChange(next: string) {
    field?.clearFormError()
    commitBindableChange({
      next,
      bound: value,
      setBound: (nextValue) => {
        value = nextValue
      },
      setInner: (nextValue) => {
        innerSingle = toSingle(nextValue)
      },
      onChange: onValueChange,
    })
  }

  function handleMultipleChange(next: string[]) {
    field?.clearFormError()
    commitBindableChange({
      next,
      bound: value,
      setBound: (nextValue) => {
        value = nextValue
      },
      setInner: (nextValue) => {
        innerMultiple = toMultiple(nextValue)
      },
      onChange: onValueChange,
    })
  }

  function clear() {
    if (multiple) handleMultipleChange([])
    else handleSingleChange('')
  }

  const hasValue = $derived(multiple ? innerMultiple.length > 0 : innerSingle !== '')

  setSelectContext({
    get size() {
      return size
    },
    get variant() {
      return variant
    },
    get alignItemWithTrigger() {
      return alignItemWithTrigger
    },
    hasValue: () => hasValue,
    clear,
    get multiple() {
      return multiple
    },
  })
</script>

{#if multiple}
  <BitsSelect.Root
    type="multiple"
    bind:value={innerMultiple}
    name={control.name}
    disabled={control.disabled}
    onValueChange={handleMultipleChange}
    {...asBitsAttrs({ ...rest, 'data-slot': 'select' })}
  >
    {@render children?.()}
  </BitsSelect.Root>
{:else}
  <BitsSelect.Root
    type="single"
    bind:value={innerSingle}
    name={control.name}
    disabled={control.disabled}
    onValueChange={handleSingleChange}
    {...asBitsAttrs({ ...rest, 'data-slot': 'select' })}
  >
    {@render children?.()}
  </BitsSelect.Root>
{/if}
