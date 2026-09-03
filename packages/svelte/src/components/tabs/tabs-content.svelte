<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Tabs as BitsTabs } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { tabsContentClasses } from './tabs-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Value of the tab this panel belongs to. */
    value: string
    children?: Snippet
  }

  let { class: className, value, children, ...rest }: Props = $props()

  const classes = $derived(cn(tabsContentClasses, className))
</script>

<BitsTabs.Content data-slot="tabs-content" {value} class={classes} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsTabs.Content>
