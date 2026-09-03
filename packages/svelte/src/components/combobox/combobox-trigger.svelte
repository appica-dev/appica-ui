<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { inputVariants } from '../input/input-variants'
  import { getComboboxContext } from './combobox-context'

  const ICON_SIZE = {
    sm: 'size-4',
    md: 'size-4.5',
    lg: 'size-5',
  } as const

  type Props = HTMLButtonAttributes & {
    start?: Snippet
    end?: Snippet
    children?: Snippet
  }

  let { class: className, start, end, children, ...rest }: Props = $props()

  const ctx = getComboboxContext()
  const classes = $derived(
    cn(
      'group/combobox-trigger',
      inputVariants({ variant: ctx.variant, size: ctx.size, state: 'self' }),
      'data-placeholder:text-foreground-subtle flex items-center justify-between',
      className,
    ),
  )
</script>

<BitsCombobox.Trigger data-slot="combobox-trigger" class={classes} {...asBitsAttrs(rest)}>
  {#if start}
    <span data-slot="combobox-trigger-start" class="-ms-1 shrink-0">
      {@render start()}
    </span>
  {/if}
  <span class="flex min-w-0 flex-1 items-center truncate text-start">
    {@render children?.()}
  </span>
  {#if end}
    <span data-slot="combobox-trigger-end" class="shrink-0">
      {@render end()}
    </span>
  {/if}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    class={cn(
      ICON_SIZE[ctx.size],
      'text-foreground -me-1 shrink-0',
      'motion-safe:transition-transform motion-safe:duration-200',
      'group-data-popup-open/combobox-trigger:rotate-180',
    )}
  >
    <path
      d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z"
    />
  </svg>
</BitsCombobox.Trigger>
