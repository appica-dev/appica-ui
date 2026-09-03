<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLElement> & { children?: Snippet }

  let {
    class: className,
    'aria-label': ariaLabel = 'breadcrumb',
    children,
    ...rest
  }: Props = $props()
</script>

<nav data-slot="breadcrumb" aria-label={ariaLabel} class={cn('text-foreground-muted w-fit text-sm font-medium', className)} {...rest}>
  {@render children?.()}
</nav>
