<script lang="ts">
  import type { HTMLThAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLThAttributes & { children?: Snippet }
  let { class: className, children, ...rest }: Props = $props()
</script>

<th data-slot="table-head" class={cn('text-start', className)} {...rest}>
  {@render children?.()}
</th>
