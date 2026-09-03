import { getContext, setContext } from 'svelte'

export type Direction = 'ltr' | 'rtl'

export interface DirectionContextValue {
  dir: Direction
}

const DEFAULT_CONTEXT: DirectionContextValue = {
  dir: 'ltr',
}

const KEY = Symbol('appica-direction')

export function setDirectionContext(value: DirectionContextValue) {
  setContext(KEY, value)
}

export function getDirectionContext(): DirectionContextValue {
  return getContext<DirectionContextValue>(KEY) ?? DEFAULT_CONTEXT
}

export function hasDirectionContext(): boolean {
  return getContext<DirectionContextValue>(KEY) != null
}
