// The channel ColorPicker uses to drive the controls composed inside it. A control
// with no `value` of its own reads the picker's color and writes back to it, which is
// what lets an area, a slider and a palette share one value without any prop wiring.
// Internal: nothing here is re-exported from the package.

import { getContext, setContext, untrack } from 'svelte'
import type { Color, ColorFormat } from '../lib/color'
import { normalizeColor } from './color-control'
import { commitBindableChange } from './utils'

export interface ColorPickerContextValue {
  readonly value: Color
  setValue: (color: Color) => void
  commitValue: (color: Color) => void
  readonly format: ColorFormat
  readonly disabled: boolean
}

const KEY = Symbol('appica-color-picker')

export function setColorPickerContext(value: ColorPickerContextValue) {
  setContext(KEY, value)
}

/** The enclosing picker, or `undefined` when the control stands on its own. */
export function getColorPickerContext(): ColorPickerContextValue | undefined {
  return getContext<ColorPickerContextValue>(KEY)
}

/** The enclosing picker, for the parts that only exist inside one. */
export function requireColorPickerContext(part: string): ColorPickerContextValue {
  const context = getColorPickerContext()
  if (!context) throw new Error(`Appica UI: <${part}> must be used within <ColorPicker>.`)
  return context
}

export interface ColorControlOptions {
  get value(): Color | string | undefined
  get defaultValue(): Color | string
  setBound: (value: Color) => void
  get onValueChange(): ((value: Color) => void) | undefined
  get onValueCommitted(): ((value: Color) => void) | undefined
  get disabled(): boolean | undefined
}

export interface ColorControl {
  readonly color: Color
  readonly disabled: boolean
  setColor: (color: Color) => void
  commitColor: (color: Color) => void
}

/**
 * Resolves a control's color from, in order: its own `value`, the enclosing picker,
 * its own state. Writes go to the picker and to the callbacks either way, so a
 * control stays reportable even when the picker owns the value.
 */
export function useColorControl(opts: ColorControlOptions): ColorControl {
  const picker = getColorPickerContext()
  let uncontrolled = $state(normalizeColor('#ffffff'))
  uncontrolled = untrack(() => normalizeColor(opts.defaultValue))

  const color = $derived(
    opts.value !== undefined ? normalizeColor(opts.value) : (picker?.value ?? uncontrolled),
  )

  return {
    get color() {
      return color
    },
    get disabled() {
      return Boolean(opts.disabled) || (picker?.disabled ?? false)
    },
    setColor(next) {
      picker?.setValue(next)
      commitBindableChange({
        next,
        bound: opts.value === undefined ? undefined : color,
        setBound: opts.setBound,
        setInner: (value) => {
          uncontrolled = value
        },
        onChange: opts.onValueChange,
      })
    },
    commitColor(next) {
      picker?.commitValue(next)
      opts.onValueCommitted?.(next)
    },
  }
}
