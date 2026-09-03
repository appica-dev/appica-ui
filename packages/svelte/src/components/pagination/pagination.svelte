<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { setPaginationContext, type PaginationSize, type PaginationVariant } from './pagination-context'

  type Props = HTMLAttributes<HTMLElement> & {
    /**
     * Link style, shared with every link via context.
     * @default 'outline'
     */
    variant?: PaginationVariant
    /**
     * Link sizing, shared via context.
     * @default 'md'
     */
    size?: PaginationSize
    children?: Snippet
  }

  let {
    class: className,
    variant = 'outline',
    size = 'md',
    'aria-label': ariaLabel = 'pagination',
    children,
    ...rest
  }: Props = $props()

  setPaginationContext({
    variant: () => variant,
    size: () => size,
  })
</script>

<nav
  aria-label={ariaLabel}
  data-slot="pagination"
  class={cn('data-disabled:opacity-disabled flex w-fit', className)}
  {...rest}
>
  {@render children?.()}
</nav>
