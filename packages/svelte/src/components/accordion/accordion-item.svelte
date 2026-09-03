<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Accordion as BitsAccordion } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getAccordionContext, setAccordionItemContext, type AccordionVariant } from './accordion-context'
  import { itemVariants } from './accordion-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Identity of this item. Required for controlled `value`. */
    value: string
    /** Override the root's `variant` for this item. */
    variant?: AccordionVariant
    /**
     * Lock this item shut and skip it during keyboard navigation.
     * @default false
     */
    disabled?: boolean
    children?: Snippet
  }

  let { class: className, value, variant, disabled, children, ...rest }: Props = $props()

  const root = getAccordionContext()
  const resolvedVariant = $derived(variant ?? root.variant)

  setAccordionItemContext({
    get variant() {
      return resolvedVariant
    },
  })

  const classes = $derived(cn(itemVariants({ variant: resolvedVariant }), className))
</script>

<BitsAccordion.Item data-slot="accordion-item" {value} {disabled} class={classes} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsAccordion.Item>
