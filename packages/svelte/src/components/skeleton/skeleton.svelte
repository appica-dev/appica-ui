<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type SkeletonEffect = 'shimmer' | 'pulse' | 'none'

  const effectClasses: Record<SkeletonEffect, string> = {
    shimmer: 'skeleton-shimmer',
    pulse: 'motion-safe:animate-pulse',
    none: '',
  }

  export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
    /**
     * Animation played while the placeholder is visible. All effects honor `prefers-reduced-motion`.
     * @default 'shimmer'
     */
    effect?: SkeletonEffect
    children?: Snippet
  }

  let { effect = 'shimmer', class: className, children, ...rest }: SkeletonProps = $props()
</script>

<div
  data-slot="skeleton"
  data-effect={effect}
  aria-hidden="true"
  class={cn(
    'text-foreground-muted relative block shrink-0 overflow-hidden rounded-md bg-current/10 backdrop-blur-xl',
    effectClasses[effect],
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
