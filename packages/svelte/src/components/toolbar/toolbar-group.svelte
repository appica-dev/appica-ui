<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getToolbarContext } from './toolbar-context.svelte'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getToolbarContext()
</script>

<div
  data-slot="toolbar-group"
  role="group"
  data-orientation={ctx.orientation}
  class={cn('flex items-center gap-1 data-[orientation=vertical]:flex-col', className)}
  {...rest}
>
  {@render children?.()}
</div>
