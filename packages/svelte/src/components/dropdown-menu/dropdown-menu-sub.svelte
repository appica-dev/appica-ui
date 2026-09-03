<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { DropdownMenu as BitsDropdownMenu } from 'bits-ui'
  import { commitBindableChange } from '../../internal/utils'

  type Props = {
    /** Controlled open state of the submenu. */
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children?: Snippet
  }

  let { open = $bindable(), onOpenChange, children }: Props = $props()

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

<BitsDropdownMenu.Sub bind:open={innerOpen} onOpenChange={handleOpenChange}>
  {@render children?.()}
</BitsDropdownMenu.Sub>
