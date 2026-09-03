<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { NavigationMenu as BitsNavigationMenu } from 'bits-ui'
  import { useDirection } from '../../hooks/use-direction/use-direction'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'
  import {
    setNavigationMenuContext,
    type NavigationMenuIconKind,
    type NavigationMenuOrientation,
    type NavigationMenuSize,
    type NavigationMenuVariant,
  } from './navigation-menu-context'
  import NavigationMenuViewport from './navigation-menu-viewport.svelte'

  type Props = HTMLAttributes<HTMLElement> & {
    /**
     * Trigger appearance - hover/active pill, or an animated underline.
     * @default 'pill'
     */
    variant?: NavigationMenuVariant
    /**
     * Scales triggers, popup radius, and link padding.
     * @default 'md'
     */
    size?: NavigationMenuSize
    /**
     * The open/close indicator shown by each `NavigationMenuIcon`.
     * @default 'chevron'
     */
    icon?: NavigationMenuIconKind
    /**
     * Render a dimmed, blurred backdrop behind the open panel.
     * @default false
     */
    backdrop?: boolean
    /**
     * Auto-render the viewport that hosts portalled content. Set `false` to render your own.
     * @default true
     */
    viewport?: boolean
    /**
     * Animate the viewport's size between items.
     * @default true
     */
    morph?: boolean
    /**
     * Layout of the trigger row.
     * @default 'horizontal'
     */
    orientation?: NavigationMenuOrientation
    /**
     * Delay in ms before a hover opens a panel.
     * @default 200
     */
    delayDuration?: number
    /** Controlled open item value. */
    value?: string
    /** Uncontrolled initial open item. */
    defaultValue?: string
    /** Fires when the open item changes. */
    onValueChange?: (value: string) => void
    children?: Snippet
  }

  let {
    class: className,
    variant = 'pill',
    size = 'md',
    icon = 'chevron',
    backdrop = false,
    viewport = true,
    morph = true,
    orientation = 'horizontal',
    delayDuration = 200,
    value = $bindable(),
    defaultValue = '',
    onValueChange,
    children,
    ...rest
  }: Props = $props()

  const direction = useDirection()

  let innerValue = $state('')
  innerValue = untrack(() => value ?? defaultValue)

  $effect(() => {
    if (value === undefined) return
    innerValue = value
  })

  function handleValueChange(next: string) {
    commitBindableChange({
      next,
      bound: value,
      setBound: (nextValue) => {
        value = nextValue
      },
      setInner: (nextValue) => {
        innerValue = nextValue
      },
      onChange: onValueChange,
    })
  }

  setNavigationMenuContext({
    get variant() {
      return variant
    },
    get size() {
      return size
    },
    get icon() {
      return icon
    },
    get orientation() {
      return orientation
    },
    get backdrop() {
      return backdrop
    },
    get morph() {
      return morph
    },
    isOpen: () => innerValue !== '',
  })
</script>

<BitsNavigationMenu.Root
  data-slot="navigation-menu"
  data-orientation={orientation}
  {orientation}
  delayDuration={delayDuration}
  dir={direction.current}
  bind:value={innerValue}
  onValueChange={handleValueChange}
  class={cn(className)}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
  {#if viewport}
    <NavigationMenuViewport />
  {/if}
</BitsNavigationMenu.Root>
