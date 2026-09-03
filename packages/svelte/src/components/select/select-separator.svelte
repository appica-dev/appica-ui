<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement>

  let { class: className, ...rest }: Props = $props()
</script>

<div
  data-slot="select-separator"
  role="separator"
  class={cn('bg-border -mx-2 my-1.5 h-px shrink-0', className)}
  {...rest}
></div>
