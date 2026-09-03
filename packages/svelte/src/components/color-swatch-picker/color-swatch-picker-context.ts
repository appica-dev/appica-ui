import { getContext, setContext } from 'svelte'
import type { Color } from '../../lib/color'
import type { ColorSwatchShape } from '../color-swatch/color-swatch-variants'

export interface ColorSwatchPickerContextValue {
  colors: Map<string, Color>
  readonly selectedKey: string | null
  select: (color: Color) => void
  readonly shape: ColorSwatchShape
  readonly disabled: boolean
}

const KEY = Symbol('appica-color-swatch-picker')

export function setColorSwatchPickerContext(value: ColorSwatchPickerContextValue) {
  setContext(KEY, value)
}

export function getColorSwatchPickerContext(): ColorSwatchPickerContextValue {
  const context = getContext<ColorSwatchPickerContextValue>(KEY)
  if (!context) throw new Error('Appica UI: <ColorSwatchPickerItem> must be used within <ColorSwatchPicker>.')
  return context
}
