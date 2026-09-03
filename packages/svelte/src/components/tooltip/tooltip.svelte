<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { Tooltip as BitsTooltip } from 'bits-ui'
  import { commitBindableChange } from '../../internal/utils'

  type Props = {
    /** Controlled open state. Pair with `onOpenChange` or `bind:open`. */
    open?: boolean
    /** Fires when the open state changes. */
    onOpenChange?: (open: boolean) => void
    /**
     * Delay in milliseconds before this tooltip opens. Overrides the provider delay.
     */
    delay?: number
    children?: Snippet
  }

  let { open = $bindable(), onOpenChange, delay, children }: Props = $props()

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

<BitsTooltip.Root bind:open={innerOpen} onOpenChange={handleOpenChange} delayDuration={delay}>
  {@render children?.()}
</BitsTooltip.Root>
