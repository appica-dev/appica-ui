<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }
  let { class: className, children, ...rest }: Props = $props()
</script>

<div
  data-slot="card-footer"
  class={cn(
    'flex flex-col-reverse gap-2 px-6 pb-6 sm:flex-row sm:items-center',
    'group-data-inset/card:px-4 group-data-inset/card:pb-4',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
