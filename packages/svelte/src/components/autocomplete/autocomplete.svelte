<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs, commitBindableChange } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import { setAutocompleteContext, type AutocompleteSize, type AutocompleteVariant } from './autocomplete-context'
  import { filterItems, stringifyItem } from './autocomplete-filter'

  type Props = {
    /**
     * The data to filter. A flat array, or `{ value, items }` objects for grouped options.
     */
    items?: readonly unknown[]
    /**
     * Controlled input value. Pair with `onValueChange`.
     */
    value?: string
    /** Uncontrolled initial input value. */
    defaultValue?: string
    /** Fires as the value changes (typing, selection, clear). */
    onValueChange?: (value: string) => void
    /** Controlled popup visibility. */
    open?: boolean
    /**
     * Uncontrolled initial open state.
     * @default false
     */
    defaultOpen?: boolean
    /** Fires when the popup opens or closes. */
    onOpenChange?: (open: boolean) => void
    /**
     * Input height, popup radius, and item sizing.
     * @default 'md'
     */
    size?: AutocompleteSize
    /**
     * Input appearance - bordered or filled.
     * @default 'outline'
     */
    variant?: AutocompleteVariant
    /**
     * Render a clear button inside the input when a value is present.
     * @default false
     */
    clearable?: boolean
    /**
     * Render a chevron button that toggles the popup.
     * @default false
     */
    icon?: boolean
    /**
     * Lay options out as a CSS grid instead of a list.
     * @default false
     */
    grid?: boolean
    /**
     * How the filter and input read each object item.
     */
    itemToStringValue?: (item: unknown) => string
    /** Match items against the query. Return `true` to keep an item. */
    filter?: (item: unknown, query: string) => boolean
    /**
     * Wrap arrow-key focus from the end of the list back to the input.
     * @default true
     */
    loopFocus?: boolean
    name?: string
    disabled?: boolean
    required?: boolean
    children?: Snippet
  }

  let {
    items,
    value = $bindable(),
    defaultValue,
    onValueChange,
    open = $bindable(),
    defaultOpen = false,
    onOpenChange,
    size = 'md',
    variant = 'outline',
    clearable = false,
    icon = false,
    grid = false,
    itemToStringValue,
    filter,
    loopFocus = true,
    name,
    disabled,
    required,
    children,
    ...rest
  }: Props = $props()

  const field = getFieldContext()
  const control = $derived(mergeFieldControl({ field, name, disabled, omitId: true }))

  let innerValue = $state('')
  let innerSelected = $state('')
  let innerOpen = $state(false)
  innerValue = untrack(() => value ?? defaultValue ?? '')
  innerSelected = untrack(() => innerValue)
  innerOpen = untrack(() => open ?? defaultOpen)

  $effect(() => {
    if (value === undefined) return
    innerValue = value
  })

  $effect(() => {
    if (open === undefined) return
    innerOpen = open
  })

  const filteredItems = $derived(filterItems(items, innerValue, itemToStringValue, filter))
  const hasItems = $derived(items != null)
  const isEmpty = $derived(hasItems && filteredItems.length === 0)
  const hasValue = $derived(innerValue !== '')

  const bitsItems = $derived(
    (items ?? []).flatMap((entry) => {
      if (entry && typeof entry === 'object' && Array.isArray((entry as { items?: unknown }).items)) {
        return (entry as { items: unknown[] }).items.map((item) => {
          const label = stringifyItem(item, itemToStringValue)
          return { value: label, label }
        })
      }
      const label = stringifyItem(entry, itemToStringValue)
      return [{ value: label, label }]
    }),
  )

  function handleValueChange(next: string) {
    field?.clearFormError()
    commitBindableChange({
      next,
      bound: value,
      setBound: (nextValue) => {
        value = nextValue
      },
      setInner: (nextValue) => {
        innerValue = nextValue
      },
      onChange: onValueChange,
    })
  }

  function handleSelectedChange(next: string) {
    innerSelected = next
    handleValueChange(next)
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

  function clear() {
    innerSelected = ''
    handleValueChange('')
  }

  setAutocompleteContext({
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
    hasItems: () => hasItems,
    filteredItems: () => filteredItems,
    isEmpty: () => isEmpty,
    stringify: (item) => stringifyItem(item, itemToStringValue),
    inputValue: () => innerValue,
    setInputValue: handleValueChange,
    hasValue: () => hasValue,
    clear,
    disabled: () => Boolean(control.disabled),
  })
</script>

<BitsCombobox.Root
  type="single"
  bind:value={innerSelected}
  bind:open={innerOpen}
  inputValue={innerValue}
  items={bitsItems}
  name={control.name}
  disabled={control.disabled}
  {required}
  loop={loopFocus}
  allowDeselect={false}
  onValueChange={handleSelectedChange}
  onOpenChange={handleOpenChange}
  {...asBitsAttrs({ ...rest, 'data-slot': 'autocomplete' })}
>
  {@render children?.()}
</BitsCombobox.Root>
