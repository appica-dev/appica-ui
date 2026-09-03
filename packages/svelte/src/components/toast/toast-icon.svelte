<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  export type ToastIconProps = HTMLAttributes<HTMLSpanElement> & { children?: Snippet }

  let { class: className, children, ...rest }: ToastIconProps = $props()
</script>

<span
  data-slot="toast-icon"
  class={cn(
    "flex shrink-0 items-center [grid-area:icon] has-[>svg]:h-lh [&>svg:not([class*='size-'])]:size-5",
    className,
  )}
  {...rest}
>
  {@render children?.()}
</span>
