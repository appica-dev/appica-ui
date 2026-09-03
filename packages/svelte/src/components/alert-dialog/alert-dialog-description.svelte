<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { AlertDialog as BitsAlertDialog } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLParagraphElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<BitsAlertDialog.Description
  data-slot="alert-dialog-description"
  class={cn('text-foreground-muted text-sm', className)}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsAlertDialog.Description>
