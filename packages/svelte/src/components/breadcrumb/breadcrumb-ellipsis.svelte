<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLSpanElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<span
  data-slot="breadcrumb-ellipsis"
  role="presentation"
  aria-hidden="true"
  class={cn('inline-flex items-center justify-center [&_svg]:size-4.5!', className)}
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
