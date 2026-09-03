<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getSparklineContext, type SparklinePoint } from './sparkline-context'

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    /** Render snippet to customize the displayed text. Omit for the raw label. */
    children?: Snippet<[string, SparklinePoint]>
  }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getSparklineContext()
  const data = $derived(ctx.data())
  const labels = $derived(ctx.labels())
  const activeIndex = $derived(ctx.activeIndex())
  const index = $derived(activeIndex ?? data.length - 1)
  const label = $derived(labels?.[index] ?? '')
  const point = $derived({ index, value: data[index] ?? NaN, label } satisfies SparklinePoint)
</script>

{#if labels}
  <span data-slot="sparkline-label" class={cn('text-foreground-muted text-xs', className)} {...rest}>
    {#if children}
      {@render children(label, point)}
    {:else}
      {label}
    {/if}
  </span>
{/if}
