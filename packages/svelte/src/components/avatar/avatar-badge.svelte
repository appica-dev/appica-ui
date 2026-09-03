<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /**
     * Add a pulsing ping behind the dot (skipped under reduced motion).
     * @default false
     */
    animate?: boolean
    children?: Snippet
  }

  let { animate = false, class: className, children, ...rest }: Props = $props()
</script>

<span
  data-slot="avatar-badge"
  class={cn(
    'bg-background text-success-emphasis absolute inset-e-0 bottom-0 z-1 flex size-[30%] items-center justify-center rounded-full',
    className,
  )}
  {...rest}
>
  <span class="size-[66%] rounded-full bg-current"></span>
  {#if animate}
    <span class="animate-ping-paced absolute h-full w-full rounded-full bg-current opacity-50 motion-reduce:hidden"></span>
  {/if}
  {@render children?.()}
</span>
