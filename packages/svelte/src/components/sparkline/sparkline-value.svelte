<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getSparklineContext } from './sparkline-context'
  import { formatNumber } from './sparkline-geometry'

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    /** Render snippet to fully customize the displayed text. Omit for the number. */
    children?: Snippet<[string, number]>
  }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getSparklineContext()
  const data = $derived(ctx.data())
  const activeIndex = $derived(ctx.activeIndex())
  const index = $derived(activeIndex ?? data.length - 1)
  const value = $derived(data[index] ?? NaN)
  const formatted = $derived(formatNumber(value, ctx.format(), ctx.locale()))
</script>

<span
  data-slot="sparkline-value"
  class={cn('text-foreground-intense text-sm font-semibold tabular-nums', className)}
  {...rest}
>
  {#if children}
    {@render children(formatted, value)}
  {:else}
    {formatted}
  {/if}
</span>
