import { getContext, setContext } from 'svelte'

export type KbdSize = 'sm' | 'md' | 'lg'

export const SIZE_CLASSES: Record<KbdSize, string> = {
  sm: 'h-5 min-w-5 text-xs px-1.25 rounded-2xs',
  md: 'h-6 min-w-6 text-sm px-1.5 rounded-[calc(var(--radius-xs)-0.0625rem)]',
  lg: 'h-7 min-w-7 text-base px-1.75 rounded-xs',
}

export interface KbdGroupContextValue {
  size: KbdSize
}

const KEY = Symbol('appica-kbd-group')

export function setKbdGroupContext(value: KbdGroupContextValue) {
  setContext(KEY, value)
}

export function getKbdGroupContext(): KbdGroupContextValue | undefined {
  return getContext<KbdGroupContextValue>(KEY)
}
