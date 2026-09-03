import { getContext, setContext } from 'svelte'
import type { VariantProps } from 'class-variance-authority'
import type { buttonVariants } from '../button/button-variants'

type ButtonGroupVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
type ButtonGroupSize = NonNullable<VariantProps<typeof buttonVariants>['size']>

interface ButtonGroupContextValue {
  variant?: ButtonGroupVariant
  size?: ButtonGroupSize
  disabled?: boolean
}

const BUTTON_GROUP_KEY = Symbol('appica-button-group')

export function setButtonGroupContext(value: ButtonGroupContextValue) {
  setContext(BUTTON_GROUP_KEY, value)
}

export function getButtonGroupContext(): ButtonGroupContextValue | undefined {
  return getContext<ButtonGroupContextValue>(BUTTON_GROUP_KEY)
}

export type { ButtonGroupContextValue, ButtonGroupVariant, ButtonGroupSize }
