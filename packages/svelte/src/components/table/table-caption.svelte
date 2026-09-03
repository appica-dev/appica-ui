<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLElement> & {
    /**
     * Render the caption above or below the table.
     * @default 'bottom'
     */
    position?: 'top' | 'bottom'
    children?: Snippet
  }

  let { position = 'bottom', class: className, children, ...rest }: Props = $props()
</script>

<caption
  data-slot="table-caption"
  class={cn('text-foreground-muted', position === 'top' ? 'caption-top pb-4' : 'caption-bottom pt-4', className)}
  {...rest}
>
  {@render children?.()}
</caption>
