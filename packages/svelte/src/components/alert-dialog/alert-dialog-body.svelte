<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<div data-slot="alert-dialog-body" class={cn('min-h-0 flex-1 px-6', className)} {...rest}>
  {@render children?.()}
</div>
