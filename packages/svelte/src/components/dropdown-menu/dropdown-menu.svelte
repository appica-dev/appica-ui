<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { DropdownMenu as BitsDropdownMenu } from 'bits-ui'
  import { commitBindableChange } from '../../internal/utils'
  import { setDropdownMenuContext, type DropdownMenuSize } from './dropdown-menu-context'

  type Props = {
    /** Controlled open state. Pair with `onOpenChange` or `bind:open`. */
    open?: boolean
    /** Fires when the open state changes. */
    onOpenChange?: (open: boolean) => void
    /**
     * Scales the popup radius, item padding, and icon size.
     * @default 'md'
     */
    size?: DropdownMenuSize
    children?: Snippet
  }

  let { open = $bindable(), onOpenChange, size = 'md', children }: Props = $props()

  setDropdownMenuContext({
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

<BitsDropdownMenu.Root bind:open={innerOpen} onOpenChange={handleOpenChange}>
  {@render children?.()}
</BitsDropdownMenu.Root>
