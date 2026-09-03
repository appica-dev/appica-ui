<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Tabs as BitsTabs } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getTabsContext } from './tabs-context'
  import {
    tabsTriggerInnerVariants,
    tabsTriggerVariants,
    type TabsListVariant,
    type TabsTriggerSize,
  } from './tabs-variants'

  type Props = HTMLButtonAttributes & {
    /** Value of the tab this trigger selects. */
    value: string
    /**
     * Override the variant for this trigger.
     * @default context
     */
    variant?: TabsListVariant
    /**
     * Override the size; `icon-*` makes a square, label-less trigger.
     * @default context
     */
    size?: TabsTriggerSize
    children?: Snippet
  }

  let { class: className, value, variant: variantProp, size: sizeProp, disabled, children, ...rest }: Props = $props()

  const ctx = getTabsContext()
  const variant = $derived(variantProp ?? ctx.variant)
  const size = $derived(sizeProp ?? ctx.size)
  const classes = $derived(cn(tabsTriggerVariants({ variant, size }), className))
</script>

<BitsTabs.Trigger data-slot="tabs-trigger" {value} {disabled} class={classes} {...asBitsAttrs(rest)}>
  <span data-slot="tabs-trigger-inner" data-orientation={ctx.orientation} class={tabsTriggerInnerVariants({ variant, size })}>
    {@render children?.()}
  </span>
</BitsTabs.Trigger>
