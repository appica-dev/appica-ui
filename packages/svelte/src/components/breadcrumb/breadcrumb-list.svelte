<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLOListElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<ol
  data-slot="breadcrumb-list"
  class={cn(
    'flex flex-wrap items-center gap-1.5 wrap-break-word',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
    className,
  )}
  {...rest}
>
  {@render children?.()}
</ol>
