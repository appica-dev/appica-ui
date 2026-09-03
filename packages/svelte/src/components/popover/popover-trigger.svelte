<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Popover as BitsPopover } from 'bits-ui'
  import type { OverlayHandle } from '../../internal/overlay-handle.svelte'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLButtonAttributes & {
    /** Detached trigger: pair with `Popover.createHandle()` when rendered outside Root. */
    handle?: OverlayHandle
    children?: Snippet
  }

  let { class: className, disabled, handle, children, ...rest }: Props = $props()
</script>

{#if handle}
  <button
    type="button"
    data-slot="popover-trigger"
    {disabled}
    class={cn(className)}
    onclick={() => {
      handle.open = true
    }}
    {...rest}
  >
    {@render children?.()}
  </button>
{:else}
  <BitsPopover.Trigger data-slot="popover-trigger" {disabled} class={cn(className)} {...asBitsAttrs(rest)}>
    {@render children?.()}
  </BitsPopover.Trigger>
{/if}
