<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { Dialog as BitsDialog } from 'bits-ui'
  import type { OverlayHandle } from '../../internal/overlay-handle.svelte'
  import { commitBindableChange } from '../../internal/utils'
  import { getDrawerContext, setDrawerContext, type DrawerSide } from './drawer-context'

  type Props = {
    /** Controlled open state. Pair with `onOpenChange` or `bind:open`. */
    open?: boolean
    /** Fires when the open state changes. */
    onOpenChange?: (open: boolean) => void
    /** Programmatic handle from `Drawer.createHandle()`. */
    handle?: OverlayHandle
    /**
     * The edge the drawer slides in from.
     * @default 'bottom'
     */
    side?: DrawerSide
    children?: Snippet
  }

  let { open = $bindable(), onOpenChange, handle, side = 'bottom', children }: Props = $props()

  const parent = getDrawerContext()
  const depth = (parent.depth ?? 0) + 1

  setDrawerContext({
    get side() {
      return side
    },
    get depth() {
      return depth
    },
  })

  let innerOpen = $state(false)
  innerOpen = untrack(() => handle?.open ?? open ?? false)

  $effect(() => {
    if (handle) innerOpen = handle.open
    else if (open !== undefined) innerOpen = open
  })

  function handleOpenChange(next: boolean) {
    if (handle) {
      handle.open = next
      innerOpen = handle.open
      onOpenChange?.(next)
      return
    }
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

<BitsDialog.Root bind:open={innerOpen} onOpenChange={handleOpenChange}>
  {@render children?.()}
</BitsDialog.Root>
