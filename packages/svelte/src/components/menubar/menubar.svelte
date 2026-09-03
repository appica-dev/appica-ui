<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Menubar as BitsMenubar } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import {
    setMenubarContext,
    type MenubarOrientation,
    type MenubarSize,
    type MenubarVariant,
  } from './menubar-context'

  const HORIZONTAL_GAP: Partial<Record<MenubarVariant, string>> = {
    pill: 'gap-0.5',
    line: 'gap-7',
  }

  const VERTICAL_GAP: Partial<Record<MenubarVariant, string>> = {
    pill: 'gap-0.5',
  }

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Trigger appearance - hover/active pill, or an animated underline.
     * @default 'pill'
     */
    variant?: MenubarVariant
    /**
     * Scales the triggers, popups, and items together.
     * @default 'md'
     */
    size?: MenubarSize
    /**
     * Layout of the trigger row.
     * @default 'horizontal'
     */
    orientation?: MenubarOrientation
    /**
     * When `true`, roving focus wraps from the last trigger to the first.
     * @default true
     */
    loop?: boolean
    children?: Snippet
  }

  let {
    class: className,
    variant = 'pill',
    size = 'md',
    orientation = 'horizontal',
    loop = true,
    children,
    ...rest
  }: Props = $props()

  setMenubarContext({
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

  const gap = $derived((orientation === 'vertical' ? VERTICAL_GAP : HORIZONTAL_GAP)[variant])
  const classes = $derived(
    cn(
      'flex w-fit',
      orientation === 'vertical' ? 'flex-col items-stretch' : 'items-center',
      gap,
      className,
    ),
  )
</script>

<BitsMenubar.Root
  data-slot="menubar"
  data-orientation={orientation}
  class={classes}
  {loop}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsMenubar.Root>
