<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { ContextMenu as BitsContextMenu } from 'bits-ui'
  import { commitBindableChange } from '../../internal/utils'
  import { setContextMenuContext, type ContextMenuSize } from './context-menu-context'

  type Props = {
    /** Controlled open state. Pair with `onOpenChange` or `bind:open`. */
    open?: boolean
    /** Fires when the open state changes. */
    onOpenChange?: (open: boolean) => void
    /**
     * Scales the popup radius, item padding, and icon size.
     * @default 'md'
     */
    size?: ContextMenuSize
    children?: Snippet
  }

  let { open = $bindable(), onOpenChange, size = 'md', children }: Props = $props()

  setContextMenuContext({
    get size() {
      return size
    },
  })

  let innerOpen = $state(false)
  innerOpen = untrack(() => open ?? false)

  $effect(() => {
    if (open !== undefined) innerOpen = open
  })

  function handleOpenChange(next: boolean) {
    commitBindableChange({
      next,
      bound: open,
      setBound: (value) => {
        open = value
      },
      setInner: (value) => {
        innerOpen = value
      },
      onChange: onOpenChange,
    })
  }
</script>

<BitsContextMenu.Root bind:open={innerOpen} onOpenChange={handleOpenChange}>
  {@render children?.()}
</BitsContextMenu.Root>
