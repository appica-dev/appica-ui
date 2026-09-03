<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Dialog as BitsDialog } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLHeadingElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<BitsDialog.Title
  data-slot="drawer-title"
  class={cn('text-foreground-intense text-2xl font-semibold', className)}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsDialog.Title>
