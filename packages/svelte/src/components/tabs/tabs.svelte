<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { Tabs as BitsTabs } from 'bits-ui'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'
  import { setTabsContext } from './tabs-context'
  import type { TabsListVariant, TabsOrientation, TabsSize } from './tabs-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Controlled selected tab. Pair with `onValueChange` or `bind:value`. */
    value?: string
    /** Uncontrolled initial tab. */
    defaultValue?: string
    /** Fires when the selected tab changes. */
    onValueChange?: (value: string) => void
    /**
     * Visual style, shared with the list and triggers via context.
     * @default 'pill'
     */
    variant?: TabsListVariant
    /**
     * Trigger sizing, shared via context.
     * @default 'md'
     */
    size?: TabsSize
    /**
     * Layout axis and the direction arrow keys move focus. Exposed as `data-orientation`.
     * @default 'horizontal'
     */
    orientation?: TabsOrientation
    children?: Snippet
  }

  let {
    class: className,
    value = $bindable(),
    defaultValue = '',
    onValueChange,
    variant = 'pill',
    size = 'md',
    orientation = 'horizontal',
    children,
    ...rest
  }: Props = $props()

  setTabsContext({
    get variant() {
      return variant
    },
    get size() {
      return size
    },
    get orientation() {
      return orientation
    },
  })

  let inner = $state('')
  inner = untrack(() => value ?? defaultValue)

  $effect(() => {
    if (value !== undefined) inner = value
  })

  function handleValueChange(next: string) {
    commitBindableChange({
      next,
      bound: value,
      setBound: (nextValue) => {
        value = nextValue
      },
      setInner: (nextValue) => {
        inner = nextValue
      },
      onChange: onValueChange,
    })
  }

  const classes = $derived(cn('flex gap-6 data-[orientation=horizontal]:flex-col', className))
</script>

<BitsTabs.Root
  data-slot="tabs"
  class={classes}
  bind:value={inner}
  onValueChange={handleValueChange}
  {orientation}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsTabs.Root>
