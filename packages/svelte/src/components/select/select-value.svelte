<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { Select as BitsSelect } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** Shown when nothing is selected. */
    placeholder?: string
  }

  let { class: className, placeholder, ...rest }: Props = $props()
</script>

<BitsSelect.Value data-slot="select-value" {placeholder} class={cn('min-w-0 flex-1 truncate text-start', className)} {...asBitsAttrs(rest)}>
  {#snippet children({ selection, placeholder: ph })}
    {#if selection.type === 'multiple'}
      {selection.selected.length ? selection.selected.map((item) => item.label).join(', ') : ph}
    {:else}
      {selection.selected?.label ?? ph}
    {/if}
  {/snippet}
</BitsSelect.Value>
