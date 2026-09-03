<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Popover as BitsPopover } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLButtonAttributes & {
    children?: Snippet
  }

  let { class: className, children, ...rest }: Props = $props()
</script>

<BitsPopover.Close data-slot="popover-close" class={cn(className)} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsPopover.Close>
