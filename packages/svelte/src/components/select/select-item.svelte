<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Select as BitsSelect } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getSelectContext } from './select-context'

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
    /** Value submitted when this item is selected. */
    value: string
    /** Typeahead label. Defaults to the item text. */
    label?: string
    disabled?: boolean
    children?: Snippet
  }

  let { class: className, value, label, disabled, children: itemLabel, ...rest }: Props = $props()

  const ctx = getSelectContext()
  const classes = $derived(
    cn(
      'text-foreground relative isolate flex w-full cursor-default items-center justify-between outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
      'before:bg-background-muted before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0',
      'active:translate-y-px active:scale-[0.98]',
      'data-highlighted:not-data-disabled:text-foreground-intense data-highlighted:not-data-disabled:before:opacity-100',
      'motion-safe:transition motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
      'data-disabled:opacity-disabled data-disabled:pointer-events-none',
      ITEM_SIZE[ctx.size],
      className,
    ),
  )
</script>

<BitsSelect.Item data-slot="select-item" {value} {label} {disabled} class={classes} {...asBitsAttrs(rest)}>
  {#snippet children({ selected })}
    <span class={cn('flex items-center text-start', ITEM_TEXT_SIZE[ctx.size])}>{@render itemLabel?.()}</span>
    <span data-slot="select-item-indicator" class="group/check text-foreground-intense shrink-0" data-selected={selected ? '' : undefined}>
      <svg
        data-icon="end"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        class="me-0.5 size-[1.125em] stroke-2"
      >
        <path
          d="M4.3 12.55 L9.25 17.5 L19.7 6.5"
          pathLength={1}
          stroke-dasharray="1 2"
          class={cn(
            'opacity-0 [stroke-dashoffset:1.02]',
            selected && 'opacity-100 [stroke-dashoffset:0]',
            'motion-safe:transition-[opacity,stroke-dashoffset] motion-safe:ease-out',
          )}
        />
      </svg>
    </span>
  {/snippet}
</BitsSelect.Item>
