'use client'

import * as React from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { type VariantProps } from 'class-variance-authority'
import { cn, useComposedRefs } from '../../internal/utils'
import { inputVariants } from '../input/input-variants'

type BaseControlProps = React.ComponentProps<typeof BaseField.Control>

type TextareaVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
type TextareaSize = NonNullable<VariantProps<typeof inputVariants>['size']>

interface TextareaProps extends Omit<React.ComponentProps<'textarea'>, 'size'> {
  /**
   * Field appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: TextareaVariant
  /**
   * Scales padding and text. Named `inputSize` to avoid colliding with native attributes.
   * @default 'md'
   */
  inputSize?: TextareaSize
  /**
   * Show a clear (✕) button once the field has a value.
   * @default false
   */
  clearable?: boolean
  /** Adornment rendered before the field, aligned to the first line. */
  startSlot?: React.ReactNode
  /** Adornment rendered after the field, aligned to the first line. */
  endSlot?: React.ReactNode
  /** Called when the clear button is pressed. */
  onClear?: () => void
}

const sizePaddingY: Record<TextareaSize, string> = {
  sm: 'py-2',
  md: 'py-2.5',
  lg: 'py-3',
}

const sizeMinHeight: Record<TextareaSize, string> = {
  sm: 'min-h-16',
  md: 'min-h-20',
  lg: 'min-h-24',
}

const sizePaddingYRem: Record<TextareaSize, string> = {
  sm: '0.5rem',
  md: '0.625rem',
  lg: '0.75rem',
}

function setNativeValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
  setter?.call(textarea, value)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
}

function Textarea({
  className,
  variant = 'outline',
  inputSize = 'md',
  clearable,
  startSlot,
  endSlot,
  onClear,
  ref,
  rows = 3,
  ...props
}: TextareaProps) {
  const innerRef = React.useRef<HTMLTextAreaElement>(null)
  const composedRef = useComposedRefs(ref, innerRef)
  const hasWrapper = Boolean(clearable || startSlot || endSlot)

  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  const handleClear = () => {
    if (innerRef.current && props.value === undefined) {
      setNativeValue(innerRef.current, '')
    }
    innerRef.current?.focus()
    onClear?.()
  }

  if (!hasWrapper) {
    return (
      <BaseField.Control
        data-slot="textarea"
        ref={composedRef}
        render={<textarea rows={rows} />}
        className={cn(
          inputVariants({ variant, size: inputSize, state: 'self' }),
          'placeholder:text-foreground-subtle h-auto resize-y',
          sizePaddingY[inputSize],
          sizeMinHeight[inputSize],
          className,
        )}
        {...(props as BaseControlProps)}
        {...(invalid ? { 'data-invalid': '' } : {})}
      />
    )
  }

  return (
    <div
      data-slot="textarea-wrapper"
      data-invalid={invalid ? '' : undefined}
      style={{ '--textarea-h': `calc(${rows} * 1lh + 2 * ${sizePaddingYRem[inputSize]} + 2px)` } as React.CSSProperties}
      className={cn(
        inputVariants({ variant, size: inputSize, state: 'within' }),
        'h-(--textarea-h) resize-y items-start overflow-hidden',
        sizeMinHeight[inputSize],
        sizePaddingY[inputSize],
        'has-[textarea:disabled]:border-border-strong! has-[textarea:disabled]:bg-background-subtle! has-[textarea:disabled]:opacity-disabled has-[textarea:disabled]:cursor-not-allowed has-[textarea:disabled]:border-dashed has-[textarea:disabled]:backdrop-blur-md',
        className,
      )}
    >
      {startSlot && (
        <div data-slot="textarea-start" className="-ms-1 inline-flex h-lh shrink-0 items-center">
          {startSlot}
        </div>
      )}
      <BaseField.Control
        data-slot="textarea"
        ref={composedRef}
        render={<textarea rows={rows} />}
        placeholder={props.placeholder ?? ' '}
        className="peer text-foreground placeholder:text-foreground-subtle min-w-0 flex-1 resize-none self-stretch bg-transparent outline-none disabled:cursor-not-allowed"
        {...(props as BaseControlProps)}
      />
      {clearable && (
        <button
          data-slot="textarea-clear"
          type="button"
          onClick={handleClear}
          className="text-foreground-subtle hover:text-foreground pointer-events-none inline-flex h-lh shrink-0 cursor-pointer items-center opacity-0 transition-[opacity,color] duration-200 peer-not-placeholder-shown:pointer-events-auto peer-not-placeholder-shown:opacity-100 motion-reduce:transition-none"
          tabIndex={-1}
          aria-label="Clear input"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" fill="currentColor" className="size-[1em]">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
      {endSlot && (
        <div data-slot="textarea-end" className="-me-1 inline-flex h-lh shrink-0 items-center">
          {endSlot}
        </div>
      )}
    </div>
  )
}

export { Textarea }
export type { TextareaProps }
