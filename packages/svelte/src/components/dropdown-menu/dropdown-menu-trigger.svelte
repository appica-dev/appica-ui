<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { DropdownMenu as BitsDropdownMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLButtonAttributes & { children?: Snippet }

  let { class: className, disabled, children, ...rest }: Props = $props()
</script>

<BitsDropdownMenu.Trigger data-slot="dropdown-menu-trigger" {disabled} class={cn(className)} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsDropdownMenu.Trigger>
