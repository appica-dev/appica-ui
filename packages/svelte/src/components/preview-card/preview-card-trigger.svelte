<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { LinkPreview as BitsLinkPreview } from 'bits-ui'
  import type { OverlayHandle } from '../../internal/overlay-handle.svelte'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAnchorAttributes & {
    /** Detached trigger: pair with `PreviewCard.createHandle()` when rendered outside Root. */
    handle?: OverlayHandle
    children?: Snippet
  }

  let { class: className, href, handle, children, ...rest }: Props = $props()
</script>

{#if handle}
  <a
    data-slot="preview-card-trigger"
    {href}
    class={cn(className)}
    onpointerenter={() => {
      handle.open = true
    }}
    onpointerleave={() => {
      handle.open = false
    }}
    onfocus={() => {
      handle.open = true
    }}
    onblur={() => {
      handle.open = false
    }}
    {...rest}
  >
    {@render children?.()}
  </a>
{:else}
  <BitsLinkPreview.Trigger data-slot="preview-card-trigger" {href} class={cn(className)} {...asBitsAttrs(rest)}>
    {@render children?.()}
  </BitsLinkPreview.Trigger>
{/if}
