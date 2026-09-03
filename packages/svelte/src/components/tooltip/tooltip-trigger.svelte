<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Tooltip as BitsTooltip } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLButtonAttributes & {
    children?: Snippet
  }

  let { class: className, disabled, children, ...rest }: Props = $props()
</script>

<BitsTooltip.Trigger data-slot="tooltip-trigger" {disabled} class={cn(className)} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsTooltip.Trigger>
