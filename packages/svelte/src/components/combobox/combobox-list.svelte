<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getComboboxContext } from './combobox-context'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Columns when `grid` is set on the root. */
    cols?: number
    children?: Snippet
  }

  let { class: className, cols, children, ...rest }: Props = $props()

  const ctx = getComboboxContext()
  const effectiveCols = $derived(cols ?? (ctx.grid ? 2 : undefined))
</script>

<BitsCombobox.Viewport
  data-slot="combobox-list"
  class={cn(
    'flex max-h-(--bits-combobox-content-available-height) min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-2',
    effectiveCols && effectiveCols > 1 && 'grid',
    className,
  )}
  style={effectiveCols && effectiveCols > 1 ? `grid-template-columns: repeat(${effectiveCols}, minmax(0, 1fr));` : undefined}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsCombobox.Viewport>
