import { getContext, setContext } from 'svelte'

export interface ReducedMotionContextValue {
  disableAnimations: boolean
}

const DEFAULT_CONTEXT: ReducedMotionContextValue = {
  disableAnimations: false,
}

const KEY = Symbol('appica-reduced-motion')

export function setReducedMotionContext(value: ReducedMotionContextValue) {
  setContext(KEY, value)
}

export function getReducedMotionContext(): ReducedMotionContextValue {
  return getContext<ReducedMotionContextValue>(KEY) ?? DEFAULT_CONTEXT
}

export function hasReducedMotionContext(): boolean {
  return getContext<ReducedMotionContextValue>(KEY) != null
}
