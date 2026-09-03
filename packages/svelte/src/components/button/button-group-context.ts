import { getContext, setContext } from 'svelte'
import type { VariantProps } from 'class-variance-authority'
import { buttonVariants } from './button-variants'

export type ButtonGroupVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
export type ButtonGroupSize = NonNullable<VariantProps<typeof buttonVariants>['size']>

export interface ButtonGroupContextValue {
  readonly variant?: ButtonGroupVariant
  readonly size?: ButtonGroupSize
  readonly disabled?: boolean
}

const KEY = Symbol('appica-button-group')

export function setButtonGroupContext(value: ButtonGroupContextValue) {
  setContext(KEY, value)
}

export function getButtonGroupContext(): ButtonGroupContextValue | undefined {
  return getContext<ButtonGroupContextValue>(KEY)
}
