<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLElement> & {
    /**
     * Root tag.
     * @default 'p'
     */
    el?: 'p' | 'div' | 'span'
    children?: Snippet
  }

  let { class: className, el = 'p', children, ...rest }: Props = $props()
</script>

<svelte:element this={el} data-slot="card-description" class={cn('text-foreground-muted text-sm', className)} {...rest}>
  {@render children?.()}
</svelte:element>
