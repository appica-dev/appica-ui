<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { AlertDialog as BitsAlertDialog } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLButtonAttributes & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<BitsAlertDialog.Cancel data-slot="alert-dialog-close" class={cn(className)} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsAlertDialog.Cancel>
