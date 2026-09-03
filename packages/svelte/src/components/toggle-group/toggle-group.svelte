<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { ToggleGroup as BitsToggleGroup } from 'bits-ui'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'
  import { setToggleGroupContext } from './toggle-group-context'

  type Orientation = 'horizontal' | 'vertical'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Controlled value. A string when single-select, an array when `multiple`. */
    value?: string | string[]
    /** Uncontrolled initial value. */
    defaultValue?: string | string[]
    /** Fires when the selected value(s) change. */
    onValueChange?: (value: string | string[]) => void
    /**
     * Allow several toggles to stay pressed.
     * @default false
     */
    multiple?: boolean
    /**
     * Lay items out in a row or a column; sets which arrow keys move focus.
     * @default 'horizontal'
     */
    orientation?: Orientation
    /**
     * Whether arrow keys wrap around the ends.
     * @default true
     */
    loop?: boolean
    /**
     * Disable every toggle in the group.
     * @default false
     */
    disabled?: boolean
    children?: Snippet
  }

  let {
    class: className,
    value = $bindable(),
    defaultValue,
    onValueChange,
    multiple = false,
    orientation = 'horizontal',
    loop = true,
    disabled,
    children,
    ...rest
  }: Props = $props()

  setToggleGroupContext()

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

  const classes = $derived(
    cn(
      'flex w-fit items-center gap-1',
      'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
      className,
    ),
  )

  $effect(() => {
    if (value === undefined) return
    if (multiple) innerMultiple = toMultiple(value)
    else innerSingle = toSingle(value)
  })

  function handleSingleChange(next: string) {
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
</script>

{#if multiple}
  <BitsToggleGroup.Root
    type="multiple"
    data-slot="toggle-group"
    class={classes}
    bind:value={innerMultiple}
    {orientation}
    {loop}
    {disabled}
    onValueChange={handleMultipleChange}
    {...asBitsAttrs(rest)}
  >
    {@render children?.()}
  </BitsToggleGroup.Root>
{:else}
  <BitsToggleGroup.Root
    type="single"
    data-slot="toggle-group"
    class={classes}
    bind:value={innerSingle}
    {orientation}
    {loop}
    {disabled}
    onValueChange={handleSingleChange}
    {...asBitsAttrs(rest)}
  >
    {@render children?.()}
  </BitsToggleGroup.Root>
{/if}
