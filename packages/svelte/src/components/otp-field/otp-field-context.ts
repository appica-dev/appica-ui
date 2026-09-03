import { getContext, setContext } from 'svelte'
import type { VariantProps } from 'class-variance-authority'
import type { inputVariants } from '../input/input-variants'

export type OTPFieldVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
export type OTPFieldSize = NonNullable<VariantProps<typeof inputVariants>['size']>

export type OTPFieldCell = {
  char: string | null | undefined
  isActive: boolean
  hasFakeCaret: boolean
}

export interface OTPFieldContextValue {
  variant: OTPFieldVariant
  size: OTPFieldSize
  invalid: boolean
}

const KEY = Symbol('appica-otp-field')

export function setOTPFieldContext(value: OTPFieldContextValue) {
  setContext(KEY, value)
}

export function getOTPFieldContext(): OTPFieldContextValue {
  const ctx = getContext<OTPFieldContextValue>(KEY)
  if (!ctx) {
    throw new Error('OTPField sub-components must be rendered inside <OTPField>')
  }
  return ctx
}
