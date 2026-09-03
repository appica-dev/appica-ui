<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLHeadingElement> & {
    children?: Snippet
  }

  let { class: className, children, ...rest }: Props = $props()
</script>

<h2 data-slot="popover-title" class={cn('text-foreground-intense text-base font-semibold', className)} {...rest}>
  {@render children?.()}
</h2>
