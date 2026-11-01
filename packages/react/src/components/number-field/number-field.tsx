'use client'

import * as React from 'react'
import { NumberField as BaseNumberField, type NumberFieldRoot } from '@base-ui/react/number-field'
import { useLabelableContext } from '@base-ui/react/internals/labelable-provider'
import { type VariantProps } from 'class-variance-authority'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react'
import { cn } from '../../internal/utils'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { buttonVariants } from '../button/button-variants'
import { inputVariants } from '../input/input-variants'

type NumberFieldVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
type NumberFieldSize = NonNullable<VariantProps<typeof inputVariants>['size']>
type AnimDirection = 'up' | 'down'

const numberFieldWidth: Record<NumberFieldSize, string> = {
  sm: 'w-24',
  md: 'w-30',
  lg: 'w-35',
}

const stepperSize: Record<NumberFieldSize, { size: 'icon-sm' | 'icon-md' | 'icon-lg'; override: string }> = {
  sm: { size: 'icon-sm', override: 'size-7 rounded-xs [&_svg]:size-3.5!' },
  md: { size: 'icon-md', override: 'size-9 rounded-sm [&_svg]:size-4!' },
  lg: { size: 'icon-lg', override: 'size-11 rounded-md [&_svg]:size-4.5!' },
}

const stepperButtonVariant: Record<NumberFieldVariant, 'soft' | 'outline'> = {
  outline: 'soft',
  soft: 'outline',
}

const inputSizeClasses: Record<NumberFieldSize, string> = {
  sm: 'text-xs pointer-coarse:text-base',
  md: 'text-sm pointer-coarse:text-base',
  lg: 'text-base',
}

const digitVariants = {
  enter: (dir: AnimDirection) => ({
    y: dir === 'up' ? '100%' : '-100%',
    opacity: 0,
  }),
  center: { y: '0%', opacity: 1 },
  exit: (dir: AnimDirection) => ({
    y: dir === 'up' ? '-100%' : '100%',
    opacity: 0,
  }),
}

const DIGIT_TRANSITION = { duration: 0.22, ease: [0.4, 0, 0.2, 1] satisfies [number, number, number, number] }

function AnimatedDigit({ char, direction }: { char: string; direction: AnimDirection }) {
  return (
    <span className="relative inline-block overflow-hidden">
      <AnimatePresence custom={direction} mode="popLayout" initial={false}>
        <m.span
          key={char}
          custom={direction}
          variants={digitVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={DIGIT_TRANSITION}
          className="inline-block"
        >
          {char}
        </m.span>
      </AnimatePresence>
    </span>
  )
}

function AnimatedNumber({ value, direction }: { value: string; direction: AnimDirection }) {
  const chars = React.useMemo(() => Array.from(value), [value])
  return (
    <span className="inline-flex leading-none">
      {chars.map((ch, i) => {
        const fromRight = chars.length - 1 - i
        return <AnimatedDigit key={`r${fromRight}`} char={ch} direction={direction} />
      })}
    </span>
  )
}

interface NumberFieldProps extends Omit<React.ComponentProps<typeof BaseNumberField.Root>, 'className'> {
  /**
   * Field appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: NumberFieldVariant
  /**
   * Scales field width, steppers, and text.
   * @default 'md'
   */
  size?: NumberFieldSize
  /** Extra classes on the field root, merged via `tailwind-merge`. */
  className?: string
  /**
   * Placeholder text shown when empty.
   * @default ' '
   */
  placeholder?: string
  /** Props forwarded to the inner `<input>` (`name`, `onChange`, `aria-*`, `className`, …). */
  inputProps?: React.ComponentProps<typeof BaseNumberField.Input>
}

function NumberField({
  className,
  variant = 'outline',
  size = 'md',
  onValueChange,
  onValueCommitted,
  format,
  locale,
  value: controlledValue,
  defaultValue,
  min,
  placeholder = ' ',
  inputProps,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rootProps
}: NumberFieldProps) {
  const resolvedVariant: NumberFieldVariant = variant
  const resolvedSize: NumberFieldSize = size
  const stepperVariant = stepperButtonVariant[resolvedVariant]
  const { size: stepperBtnSize, override: stepperOverride } = stepperSize[resolvedSize]
  const stepperClass = cn(buttonVariants({ variant: stepperVariant, size: stepperBtnSize }), stepperOverride)

  const ariaInvalid = rootProps['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  const { labelId } = useLabelableContext()
  const inputHasName = inputProps?.['aria-label'] != null || inputProps?.['aria-labelledby'] != null
  const forwardedName = inputHasName || labelId ? {} : { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy }

  const reduced = useReducedMotion()

  const formatter = React.useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, format)
    } catch {
      return new Intl.NumberFormat()
    }
  }, [locale, format])

  const formatValue = React.useCallback(
    (value: number | null | undefined) => (value == null || Number.isNaN(value) ? '' : formatter.format(value)),
    [formatter],
  )

  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = React.useState<number | null>(defaultValue ?? null)
  const currentValue = isControlled ? controlledValue : internalValue

  const [state, setState] = React.useState<{ value: string; direction: AnimDirection }>(() => ({
    value: formatValue(controlledValue ?? defaultValue ?? null),
    direction: 'up',
  }))

  const [prevValue, setPrevValue] = React.useState<number | null | undefined>(currentValue)
  if (prevValue !== currentValue) {
    setPrevValue(currentValue)
    const next = formatValue(currentValue)
    setState((prev) => (prev.value === next ? prev : { ...prev, value: next }))
  }

  const handleValueChange: NonNullable<typeof onValueChange> = (value, details) => {
    if (!isControlled) setInternalValue(value)
    setState((prev) => ({
      value: formatValue(value),
      direction:
        details.reason === 'decrement-press' ? 'down' : details.reason === 'increment-press' ? 'up' : prev.direction,
    }))
    onValueChange?.(value, details)
  }

  const handleValueCommitted: NonNullable<typeof onValueCommitted> = (value, details) => {
    onValueCommitted?.(value, details)
    if (value != null) return
    const fallback = min ?? 0
    if (!isControlled) setInternalValue(fallback)
    setState((prev) => ({ ...prev, value: formatValue(fallback) }))
    const syntheticDetails: NumberFieldRoot.ChangeEventDetails = {
      reason: 'none',
      event: details.event,
      cancel: () => {},
      allowPropagation: () => {},
      isCanceled: false,
      isPropagationAllowed: false,
      trigger: undefined,
    }
    onValueChange?.(fallback, syntheticDetails)
  }

  const [isFocused, setIsFocused] = React.useState(false)
  const suppressFocusRef = React.useRef(false)

  const handleStepperPointerDown = () => {
    suppressFocusRef.current = true
    setIsFocused(false)
    setTimeout(() => {
      suppressFocusRef.current = false
    }, 0)
  }

  const handleInputPointerDown = () => setIsFocused(true)
  const handleInputFocus = () => {
    if (suppressFocusRef.current) return
    setIsFocused(true)
  }
  const handleInputBlur = () => setIsFocused(false)

  return (
    <BaseNumberField.Root
      data-slot="number-field"
      className={cn(
        inputVariants({ variant: resolvedVariant, size: resolvedSize, state: 'within' }),
        'h-auto shrink-0 p-px',
        numberFieldWidth[resolvedSize],
        className,
      )}
      onValueChange={handleValueChange}
      onValueCommitted={handleValueCommitted}
      format={format}
      locale={locale}
      min={min}
      value={currentValue}
      {...rootProps}
      {...(invalid ? { 'data-invalid': '' } : {})}
    >
      <BaseNumberField.Decrement
        data-slot="number-field-decrement"
        aria-label="Decrease value"
        className={stepperClass}
        onPointerDown={handleStepperPointerDown}
      >
        <MinusIcon />
      </BaseNumberField.Decrement>

      <LazyMotion features={domAnimation} strict>
        <div className="relative flex-1 self-stretch overflow-hidden">
          <BaseNumberField.Input
            data-slot="number-field-input"
            placeholder={placeholder}
            {...forwardedName}
            {...inputProps}
            onPointerDown={(e) => {
              inputProps?.onPointerDown?.(e)
              handleInputPointerDown()
            }}
            onFocus={(e) => {
              inputProps?.onFocus?.(e)
              handleInputFocus()
            }}
            onBlur={(e) => {
              inputProps?.onBlur?.(e)
              handleInputBlur()
            }}
            className={cn(
              'peer text-foreground absolute inset-0 h-full w-full bg-transparent text-center outline-none',
              inputSizeClasses[resolvedSize],
              !reduced &&
                !isFocused &&
                'not-placeholder-shown:text-transparent not-placeholder-shown:caret-transparent',
              inputProps?.className,
            )}
          />
          {!reduced && (
            <div
              data-slot="number-field-overlay"
              aria-hidden="true"
              className={cn(
                'text-foreground pointer-events-none absolute inset-0 z-10 flex items-center justify-center peer-placeholder-shown:invisible',
                isFocused && 'invisible',
                inputSizeClasses[resolvedSize],
              )}
            >
              <AnimatedNumber value={state.value} direction={state.direction} />
            </div>
          )}
        </div>
      </LazyMotion>

      <BaseNumberField.Increment
        data-slot="number-field-increment"
        aria-label="Increase value"
        className={stepperClass}
        onPointerDown={handleStepperPointerDown}
      >
        <PlusIcon />
      </BaseNumberField.Increment>
    </BaseNumberField.Root>
  )
}

function MinusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export { NumberField }
export type { NumberFieldProps }
