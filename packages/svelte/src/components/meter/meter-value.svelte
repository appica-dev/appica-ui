<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getMeterContext } from './meter-context'

  export type MeterValueProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    children?: Snippet<[string, number]>
  }

  let { class: className, children, ...rest }: MeterValueProps = $props()

  const ctx = getMeterContext()
  const formatted = $derived(ctx.formatted())
  const value = $derived(ctx.value())
</script>

<span data-slot="meter-value" class={cn('text-foreground text-sm', className)} {...rest}>
  {#if children}
    {@render children(formatted, value)}
  {:else}
    {formatted}
  {/if}
</span>
