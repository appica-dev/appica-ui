<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { AlertDialog as BitsAlertDialog } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLHeadingElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<BitsAlertDialog.Title
  data-slot="alert-dialog-title"
  class={cn('text-foreground-intense text-xl font-semibold', className)}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsAlertDialog.Title>
