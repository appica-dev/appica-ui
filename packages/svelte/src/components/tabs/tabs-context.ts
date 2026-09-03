import { getContext, setContext } from 'svelte'
import type { TabsListVariant, TabsOrientation, TabsSize } from './tabs-variants'

export interface TabsContextValue {
  variant: TabsListVariant
  size: TabsSize
  orientation: TabsOrientation
}

const KEY = Symbol('appica-tabs')

export function setTabsContext(value: TabsContextValue) {
  setContext(KEY, value)
}

export function getTabsContext(): TabsContextValue {
  const ctx = getContext<TabsContextValue>(KEY)
  if (!ctx) {
    throw new Error('Tabs sub-components must be rendered inside <Tabs>')
  }
  return ctx
}
