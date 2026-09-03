<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { Accordion as BitsAccordion } from 'bits-ui'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'
  import {
    setAccordionContext,
    type AccordionIcon,
    type AccordionIconPosition,
    type AccordionIconVariant,
    type AccordionVariant,
  } from './accordion-context'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Controlled open item(s). A string when single, an array when `multiple`. */
    value?: string | string[]
    /** Uncontrolled initial value. */
    defaultValue?: string | string[]
    /** Fires when the open item(s) change. */
    onValueChange?: (value: string | string[]) => void
    /**
     * Allow several items to stay open.
     * @default false
     */
    multiple?: boolean
    /**
     * Surface style applied to every item.
     * @default 'default'
     */
    variant?: AccordionVariant
    /**
     * The open/close indicator, or `false` to hide it.
     * @default 'chevron'
     */
    icon?: AccordionIcon
    /**
     * Plain glyph, or wrapped in a tinted tile.
     * @default 'icon'
     */
    iconVariant?: AccordionIconVariant
    /**
     * Place the icon after or before the trigger label.
     * @default 'end'
     */
    iconPosition?: AccordionIconPosition
    /**
     * Disable every item.
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
    variant = 'default',
    icon = 'chevron',
    iconVariant = 'icon',
    iconPosition = 'end',
    disabled,
    children,
    ...rest
  }: Props = $props()

  setAccordionContext({
    get variant() {
      return variant
    },
    get icon() {
      return icon
    },
    get iconVariant() {
      return iconVariant
    },
    get iconPosition() {
      return iconPosition
    },
  })

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

  const classes = $derived(cn('flex w-full flex-col', variant !== 'flush' && 'gap-1', className))
</script>

{#if multiple}
  <BitsAccordion.Root
    type="multiple"
    data-slot="accordion"
    class={classes}
    bind:value={innerMultiple}
    onValueChange={handleMultipleChange}
    {disabled}
    {...asBitsAttrs(rest)}
  >
    {@render children?.()}
  </BitsAccordion.Root>
{:else}
  <BitsAccordion.Root
    type="single"
    data-slot="accordion"
    class={classes}
    bind:value={innerSingle}
    onValueChange={handleSingleChange}
    {disabled}
    {...asBitsAttrs(rest)}
  >
    {@render children?.()}
  </BitsAccordion.Root>
{/if}
