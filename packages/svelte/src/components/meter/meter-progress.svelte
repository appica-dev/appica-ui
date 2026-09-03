<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getMeterContext } from './meter-context'

  export type MeterProgressProps = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: MeterProgressProps = $props()

  const ctx = getMeterContext()
  const indicatorBg = $derived(ctx.indicatorBg())
  const pct = $derived(ctx.percent())
</script>

<div
  data-slot="meter-progress"
  class={cn('bg-background-strong relative h-1.5 w-full overflow-hidden rounded-full', className)}
  {...rest}
>
  <div
    data-slot="meter-indicator"
    class={cn(
      'absolute inset-y-0 inset-s-0 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none',
      indicatorBg,
    )}
    style={`width: ${pct}%`}
  ></div>
  {@render children?.()}
</div>
