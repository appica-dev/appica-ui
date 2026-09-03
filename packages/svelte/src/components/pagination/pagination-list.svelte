<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLUListElement> & { children?: Snippet }
  let { class: className, children, ...rest }: Props = $props()
</script>

<ul data-slot="pagination-list" class={cn('flex items-center gap-1', className)} {...rest}>
  {@render children?.()}
</ul>
