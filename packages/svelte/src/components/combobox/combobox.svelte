<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs, commitBindableChange } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import { setComboboxContext, type ComboboxSize, type ComboboxVariant } from './combobox-context'

  type Props = {
    /** Controlled value. A string when single-select, an array when `multiple`. */
    value?: string | string[]
    /** Uncontrolled initial value. */
    defaultValue?: string | string[]
    /** Fires when the selected value(s) change. */
    onValueChange?: (value: string | string[]) => void
    /** Controlled popup visibility. */
    open?: boolean
    /** Uncontrolled initial open state. */
    defaultOpen?: boolean
    /** Fires when the popup opens or closes. */
    onOpenChange?: (open: boolean) => void
    /**
     * Input height, popup radius, and item sizing.
     * @default 'md'
     */
    size?: ComboboxSize
    /**
     * Input appearance - bordered or filled.
     * @default 'outline'
     */
    variant?: ComboboxVariant
    /**
     * Render a clear button inside the input when a value is present.
     * @default false
     */
    clearable?: boolean
    /**
     * Render a chevron button that toggles the popup.
     * @default true
     */
    icon?: boolean
    /**
     * Lay list items out as a CSS grid.
     * @default false
     */
    grid?: boolean
    /**
     * Allow several items to stay selected.
     * @default false
     */
    multiple?: boolean
    name?: string
    disabled?: boolean
    children?: Snippet
  }

  let {
    value = $bindable(),
    defaultValue,
    onValueChange,
    open = $bindable(),
    defaultOpen = false,
    onOpenChange,
    size = 'md',
    variant = 'outline',
    clearable = false,
    icon = true,
    grid = false,
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
  let innerOpen = $state(false)
  innerSingle = untrack(() => toSingle(value ?? defaultValue))
  innerMultiple = untrack(() => toMultiple(value ?? defaultValue))
  innerOpen = untrack(() => open ?? defaultOpen)

  $effect(() => {
    if (value === undefined) return
    if (multiple) innerMultiple = toMultiple(value)
    else innerSingle = toSingle(value)
  })

  $effect(() => {
    if (open === undefined) return
    innerOpen = open
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

  function remove(item: string) {
    if (!multiple) {
      if (innerSingle === item) handleSingleChange('')
      return
    }
    handleMultipleChange(innerMultiple.filter((entry) => entry !== item))
  }

  function handleOpenChange(next: boolean) {
    commitBindableChange({
      next,
      bound: open,
      setBound: (nextValue) => {
        open = nextValue
      },
      setInner: (nextValue) => {
        innerOpen = nextValue
      },
      onChange: onOpenChange,
    })
  }

  function toggle() {
    handleOpenChange(!innerOpen)
  }

  const hasValue = $derived(multiple ? innerMultiple.length > 0 : innerSingle !== '')

  setComboboxContext({
    get size() {
      return size
    },
    get variant() {
      return variant
    },
    get clearable() {
      return clearable
    },
    get icon() {
      return icon
    },
    get grid() {
      return grid
    },
    get multiple() {
      return multiple
    },
    hasValue: () => hasValue,
    clear,
    remove,
    selected: () => (multiple ? innerMultiple : innerSingle),
    toggle,
  })
</script>

{#if multiple}
  <BitsCombobox.Root
    type="multiple"
    bind:value={innerMultiple}
    bind:open={innerOpen}
    name={control.name}
    disabled={control.disabled}
    onValueChange={handleMultipleChange}
    onOpenChange={handleOpenChange}
    {...asBitsAttrs({ ...rest, 'data-slot': 'combobox' })}
  >
    {@render children?.()}
  </BitsCombobox.Root>
{:else}
  <BitsCombobox.Root
    type="single"
    bind:value={innerSingle}
    bind:open={innerOpen}
    name={control.name}
    disabled={control.disabled}
    onValueChange={handleSingleChange}
    onOpenChange={handleOpenChange}
    {...asBitsAttrs({ ...rest, 'data-slot': 'combobox' })}
  >
    {@render children?.()}
  </BitsCombobox.Root>
{/if}
