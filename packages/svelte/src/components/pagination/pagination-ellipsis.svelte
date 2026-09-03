<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { ELLIPSIS_SIZE, getPaginationContext } from './pagination-context'

  type Props = HTMLAttributes<HTMLSpanElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getPaginationContext()
  const size = $derived(ctx.size())
</script>

<span
  data-slot="pagination-ellipsis"
  aria-hidden="true"
  class={cn('text-foreground-strong inline-flex items-end justify-center', ELLIPSIS_SIZE[size], className)}
  {...rest}
>
  {#if children}
    {@render children()}
  {:else}
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  {/if}
</span>
