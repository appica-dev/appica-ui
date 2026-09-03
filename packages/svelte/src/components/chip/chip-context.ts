import { getContext, setContext } from 'svelte'
import type { ChipSize, ChipVariant } from './chip-variants'

export interface ChipGroupContextValue {
  register: (dismiss: () => void) => () => void
  variant?: ChipVariant
  size?: ChipSize
}

const KEY = Symbol('appica-chip-group')

export function setChipGroupContext(value: ChipGroupContextValue) {
  setContext(KEY, value)
}

export function getChipGroupContext(): ChipGroupContextValue | undefined {
  return getContext<ChipGroupContextValue>(KEY)
}
