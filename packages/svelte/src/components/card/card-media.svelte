<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }
  let { class: className, children, ...rest }: Props = $props()
</script>

<div
  data-slot="card-media"
  class={cn(
    'relative shrink-0 overflow-hidden',
    'group-data-inset/card:rounded-[calc(var(--card-radius)*3/4)]',
    '[&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
