<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { formatPercent, getProgressContext } from './progress-context'

  export type ProgressValueProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    /** Render snippet to customize the displayed text. Receives the formatted string and the numeric value. Omit for the default. */
    children?: Snippet<[string, number | null]>
  }

  let { class: className, children, ...rest }: ProgressValueProps = $props()

  const ctx = getProgressContext()
  const formatted = $derived(formatPercent(ctx.value(), ctx.min(), ctx.max(), ctx.format(), ctx.locale()))
</script>

<span data-slot="progress-value" class={cn('text-foreground text-sm', className)} {...rest}>
  {#if children}
    {@render children(formatted, ctx.value())}
  {:else}
    {formatted}
  {/if}
</span>
