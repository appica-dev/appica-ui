import { getContext, setContext } from 'svelte'
import type { ToastPosition } from './toast-manager.svelte'

const KEY = Symbol('appica-toast-view')

export type ToastViewContext = {
  position: ToastPosition
  expanded: boolean
  focused: boolean
}

export function setToastViewContext(value: ToastViewContext) {
  setContext(KEY, value)
}

export function getToastViewContext(): ToastViewContext {
  return (
    getContext<ToastViewContext>(KEY) ?? {
      position: 'bottom-right',
      expanded: false,
      focused: false,
    }
  )
}
