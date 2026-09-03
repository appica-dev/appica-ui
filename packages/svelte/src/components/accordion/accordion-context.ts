import { getContext, setContext } from 'svelte'

export type AccordionVariant = 'default' | 'alt' | 'flush'
export type AccordionIcon = 'chevron' | 'plus' | false
export type AccordionIconVariant = 'icon' | 'icon-box'
export type AccordionIconPosition = 'end' | 'start'

export interface AccordionContextValue {
  variant: AccordionVariant
  icon: AccordionIcon
  iconVariant: AccordionIconVariant
  iconPosition: AccordionIconPosition
}

const ROOT_KEY = Symbol('appica-accordion')
const ITEM_KEY = Symbol('appica-accordion-item')

const DEFAULT_CONTEXT: AccordionContextValue = {
  variant: 'default',
  icon: 'chevron',
  iconVariant: 'icon',
  iconPosition: 'end',
}

export function setAccordionContext(value: AccordionContextValue) {
  setContext(ROOT_KEY, value)
}

export function getAccordionContext(): AccordionContextValue {
  return getContext<AccordionContextValue>(ROOT_KEY) ?? DEFAULT_CONTEXT
}

export function setAccordionItemContext(value: { variant: AccordionVariant }) {
  setContext(ITEM_KEY, value)
}

export function getAccordionItemContext(): { variant: AccordionVariant } | undefined {
  return getContext<{ variant: AccordionVariant }>(ITEM_KEY)
}
