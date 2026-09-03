<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Dialog as BitsDialog } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLButtonAttributes & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<BitsDialog.Close data-slot="dialog-close" class={cn(className)} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsDialog.Close>
