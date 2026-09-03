<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<div data-slot="dialog-header" class={cn('flex shrink-0 flex-col gap-2 p-6', className)} {...rest}>
  {@render children?.()}
</div>
