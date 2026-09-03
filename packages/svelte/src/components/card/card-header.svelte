<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }
  let { class: className, children, ...rest }: Props = $props()
</script>

<div data-slot="card-header" class={cn('flex flex-1 flex-col gap-1.5 p-6 group-data-inset/card:px-4', className)} {...rest}>
  {@render children?.()}
</div>
