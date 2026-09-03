<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<div
  data-slot="drawer-indent"
  class={cn(
    'origin-top overflow-hidden transition-[transform,border-radius] ease-[cubic-bezier(0.32,0.72,0,1)]',
    'motion-safe:duration-400 motion-reduce:transition-none',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
