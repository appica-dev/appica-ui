import { getContext, setContext } from 'svelte'
import type { ToastData } from './toast-manager.svelte'

const KEY = Symbol('appica-toast-item')

export type ToastItemContext = {
  toast: ToastData
  titleId?: string
  descriptionId?: string
  setTitleId: (id: string | undefined) => void
  setDescriptionId: (id: string | undefined) => void
}

export function setToastItemContext(value: ToastItemContext) {
  setContext(KEY, value)
}

export function getToastItemContext(): ToastItemContext | undefined {
  return getContext<ToastItemContext>(KEY)
}
