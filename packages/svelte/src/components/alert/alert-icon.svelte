<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getAlertVariant } from './alert-context'
  import { alertIconColor } from './alert-variants'

  export type AlertIconProps = HTMLAttributes<HTMLSpanElement> & { children?: Snippet }
  let { class: className, children, ...rest }: AlertIconProps = $props()

  const readVariant = getAlertVariant()
  const variant = $derived(readVariant())
</script>

<span
  data-slot="alert-icon"
  class={cn(
    "me-3 flex h-lh shrink-0 items-center [grid-area:icon] [&_svg:not([class*='size-'])]:size-5",
    alertIconColor[variant],
    className,
  )}
  {...rest}
>
  {@render children?.()}
</span>
