<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Tabs as BitsTabs } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getTabsContext, setTabsContext } from './tabs-context'
  import { tabsIndicatorVariants, tabsListVariants, type TabsListVariant, type TabsSize } from './tabs-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Override the root's variant for this list.
     * @default context
     */
    variant?: TabsListVariant
    /**
     * Override the root's size for this list.
     * @default context
     */
    size?: TabsSize
    children?: Snippet
  }

  let { class: className, variant: variantProp, size: sizeProp, children, ...rest }: Props = $props()

  const ctx = getTabsContext()
  const variant = $derived(variantProp ?? ctx.variant)
  const size = $derived(sizeProp ?? ctx.size)

  setTabsContext({
    get variant() {
      return variant
    },
    get size() {
      return size
    },
    get orientation() {
      return ctx.orientation
    },
  })

  const classes = $derived(cn(tabsListVariants({ variant, size }), className))

  let listEl = $state<HTMLElement | null>(null)

  $effect(() => {
    const node = listEl
    if (!node) return
    const update = () => {
      const active = node.querySelector<HTMLElement>('[data-state="active"]')
      if (!active) return
      const listRect = node.getBoundingClientRect()
      const tabRect = active.getBoundingClientRect()
      node.style.setProperty('--active-tab-left', `${tabRect.left - listRect.left}px`)
      node.style.setProperty('--active-tab-right', `${listRect.right - tabRect.right}px`)
      node.style.setProperty('--active-tab-top', `${tabRect.top - listRect.top}px`)
      node.style.setProperty('--active-tab-bottom', `${listRect.bottom - tabRect.bottom}px`)
      node.style.setProperty('--active-tab-width', `${tabRect.width}px`)
      node.style.setProperty('--active-tab-height', `${tabRect.height}px`)
    }
    const observer = new MutationObserver(update)
    observer.observe(node, { attributes: true, subtree: true, attributeFilter: ['data-state'] })
    const ro = new ResizeObserver(update)
    ro.observe(node)
    queueMicrotask(update)
    return () => {
      observer.disconnect()
      ro.disconnect()
    }
  })
</script>

<BitsTabs.List bind:ref={listEl} data-slot="tabs-list" class={classes} {...asBitsAttrs(rest)}>
  <span
    data-slot="tabs-indicator"
    data-orientation={ctx.orientation}
    class={tabsIndicatorVariants({ variant })}
    aria-hidden="true"
  ></span>
  {@render children?.()}
</BitsTabs.List>
