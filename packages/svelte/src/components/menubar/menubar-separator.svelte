<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { Menubar as BitsMenubar } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement>

  let { class: className, ...rest }: Props = $props()
</script>

<BitsMenubar.Separator
  data-slot="menubar-separator"
  class={cn('bg-border -mx-2 my-1.5 h-px shrink-0', className)}
  {...asBitsAttrs(rest)}
/>
