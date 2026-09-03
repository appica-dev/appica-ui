<script lang="ts">
  import Accordion from './accordion.svelte'
  import AccordionItem from './accordion-item.svelte'
  import AccordionTrigger from './accordion-trigger.svelte'
  import AccordionContent from './accordion-content.svelte'
  import type { AccordionIcon, AccordionIconPosition, AccordionIconVariant } from './accordion-context'

  let {
    defaultValue,
    disabled,
    multiple,
    itemDisabled,
    icon,
    iconVariant,
    iconPosition,
  }: {
    defaultValue?: string | string[]
    disabled?: boolean
    multiple?: boolean
    itemDisabled?: boolean
    icon?: AccordionIcon
    iconVariant?: AccordionIconVariant
    iconPosition?: AccordionIconPosition
  } = $props()
</script>

<Accordion {defaultValue} {disabled} {multiple} {icon} {iconVariant} {iconPosition}>
  <AccordionItem value="one" disabled={itemDisabled}>
    <AccordionTrigger>First</AccordionTrigger>
    <AccordionContent>
      <p>First body</p>
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="two">
    <AccordionTrigger>Second</AccordionTrigger>
    <AccordionContent>
      <p>Second body</p>
    </AccordionContent>
  </AccordionItem>
</Accordion>
