<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLParagraphElement> & {
    children?: Snippet
  }

  let { class: className, children, ...rest }: Props = $props()
</script>

<p data-slot="popover-description" class={cn('text-sm', className)} {...rest}>
  {@render children?.()}
</p>
