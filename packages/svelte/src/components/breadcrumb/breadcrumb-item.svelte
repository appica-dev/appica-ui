<script lang="ts">
  import type { HTMLLiAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLLiAttributes & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<li data-slot="breadcrumb-item" class={cn("inline-flex items-center gap-1.5 [&_svg:not([class*='size-'])]:size-4", className)} {...rest}>
  {@render children?.()}
</li>
