<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Dialog as BitsDialog } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLParagraphElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<BitsDialog.Description
  data-slot="drawer-description"
  class={cn('text-foreground-muted text-sm', className)}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsDialog.Description>
