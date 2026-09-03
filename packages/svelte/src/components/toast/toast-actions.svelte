<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  export type ToastActionsProps = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: ToastActionsProps = $props()
</script>

<div data-slot="toast-actions" class={cn('flex justify-end gap-2 pt-2 [grid-area:actions]', className)} {...rest}>
  {@render children?.()}
</div>
