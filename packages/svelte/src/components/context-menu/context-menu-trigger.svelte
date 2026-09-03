<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { ContextMenu as BitsContextMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & {
    disabled?: boolean
    children?: Snippet
  }

  let { class: className, disabled, children, ...rest }: Props = $props()
</script>

<BitsContextMenu.Trigger data-slot="context-menu-trigger" {disabled} class={cn(className)} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsContextMenu.Trigger>
