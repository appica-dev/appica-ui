import { getContext, setContext } from 'svelte'

export type DrawerSide = 'top' | 'bottom' | 'left' | 'right'

export interface DrawerContextValue {
  side: DrawerSide
  depth: number
}

const KEY = Symbol('appica-drawer')

export function setDrawerContext(value: DrawerContextValue) {
  setContext(KEY, value)
}

export function getDrawerContext(): DrawerContextValue {
  return (
    getContext<DrawerContextValue>(KEY) ?? {
      side: 'bottom',
      depth: 0,
    }
  )
}
