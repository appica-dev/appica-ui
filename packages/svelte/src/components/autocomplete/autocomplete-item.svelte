<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getAutocompleteContext } from './autocomplete-context'

  const ITEM_SIZE = {
    sm: "gap-1 rounded-xs py-1.5 px-2.5 text-xs has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
    md: "gap-1.5 rounded-sm py-2 px-3 text-sm has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
    lg: "gap-1.5 rounded-md py-2.5 px-3.5 text-base has-data-[icon=end]:pe-2.5 has-data-[icon=start]:ps-2.5 [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
  } as const

  const ITEM_TEXT_SIZE = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-1.5',
  } as const

  type Props = HTMLAttributes<HTMLDivElement> & {
    value: unknown
    label?: string
    disabled?: boolean
    children?: Snippet
  }

  let { class: className, value, label, disabled, children, ...rest }: Props = $props()

  const ctx = getAutocompleteContext()
  const stringValue = $derived(ctx.stringify(value))
  const resolvedLabel = $derived(label ?? stringValue)
  const classes = $derived(
    cn(
      'text-foreground relative isolate flex w-full cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
      'before:bg-background-muted before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0',
      'active:translate-y-px active:scale-[0.98]',
      'data-highlighted:not-data-disabled:text-foreground-intense data-highlighted:not-data-disabled:before:opacity-100',
      'motion-safe:transition motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
      'motion-safe:active:duration-100 motion-safe:active:ease-in-out',
      'motion-safe:before:transition-opacity motion-safe:before:duration-200 motion-safe:before:ease-out',
      'data-disabled:opacity-disabled data-disabled:pointer-events-none',
      ITEM_SIZE[ctx.size],
      className,
    ),
  )
</script>

<BitsCombobox.Item data-slot="autocomplete-item" value={stringValue} label={resolvedLabel} {disabled} class={classes} {...asBitsAttrs(rest)}>
  <span class={cn('flex items-center text-start', ITEM_TEXT_SIZE[ctx.size])}>{@render children?.()}</span>
</BitsCombobox.Item>
