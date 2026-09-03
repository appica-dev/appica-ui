<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { Collapsible as BitsCollapsible } from 'bits-ui'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Controlled open state. Pair with `onOpenChange` or `bind:open`. */
    open?: boolean
    /**
     * Uncontrolled initial open state.
     * @default false
     */
    defaultOpen?: boolean
    /** Fires when the open state changes. */
    onOpenChange?: (open: boolean) => void
    /**
     * Disable the trigger and skip pointer events.
     * @default false
     */
    disabled?: boolean
    children?: Snippet
  }

  let {
    class: className,
    open = $bindable(),
    defaultOpen = false,
    onOpenChange,
    disabled,
    children,
    ...rest
  }: Props = $props()

  let innerOpen = $state(false)
  innerOpen = untrack(() => open ?? defaultOpen)

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

  const classes = $derived(cn(className))
</script>

<BitsCollapsible.Root
  data-slot="collapsible"
  class={classes}
  bind:open={innerOpen}
  onOpenChange={handleOpenChange}
  {disabled}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsCollapsible.Root>
