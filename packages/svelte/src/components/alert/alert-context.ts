import { getContext, setContext } from 'svelte'
import type { AlertVariant } from './alert-variants'

const KEY = Symbol('appica-alert-variant')

export function setAlertVariant(variant: () => AlertVariant) {
  setContext(KEY, variant)
}

export function getAlertVariant(): () => AlertVariant {
  return getContext<() => AlertVariant>(KEY) ?? (() => 'default')
}
