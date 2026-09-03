<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '../../internal/utils'
  import { getToolbarContext } from './toolbar-context.svelte'

  type Props = HTMLAttributes<HTMLDivElement>

  let { class: className, ...rest }: Props = $props()

  const ctx = getToolbarContext()
  const orientation = $derived(ctx.orientation === 'vertical' ? 'horizontal' : 'vertical')
</script>

<div
  data-slot="toolbar-separator"
  role="separator"
  data-orientation={orientation}
  class={cn(
    'bg-border shrink-0',
    'data-[orientation=vertical]:mx-0.5 data-[orientation=vertical]:h-5 data-[orientation=vertical]:w-(--border-width)',
    'data-[orientation=horizontal]:my-0.5 data-[orientation=horizontal]:h-(--border-width) data-[orientation=horizontal]:w-full',
    className,
  )}
  {...rest}
></div>
