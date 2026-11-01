import * as React from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { cn } from '../../internal/utils'

type FieldProps = React.ComponentProps<typeof BaseField.Root>

function Field({ className, ...props }: FieldProps) {
  return <BaseField.Root data-slot="field" className={cn(className)} {...props} />
}

type FieldLabelProps = React.ComponentProps<typeof BaseField.Label>

function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <BaseField.Label
      data-slot="field-label"
      className={cn(
        'text-foreground-intense mb-1.5 flex w-fit items-center text-sm font-medium select-none',
        'data-disabled:opacity-disabled',
        className,
      )}
      {...props}
    />
  )
}

type FieldDescriptionProps = React.ComponentProps<typeof BaseField.Description>

function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <BaseField.Description
      data-slot="field-description"
      className={cn('text-foreground-muted data-disabled:opacity-disabled mt-1.5 text-sm', className)}
      {...props}
    />
  )
}

type FieldErrorProps = React.ComponentProps<typeof BaseField.Error>

function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        'grid grid-rows-[0fr]',
        'has-[[data-slot=field-error]:not([data-starting-style]):not([data-ending-style])]:grid-rows-[1fr]',
        'motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-safe:ease-out',
      )}
    >
      <BaseField.Error
        data-slot="field-error"
        className={cn(
          'min-h-0 overflow-hidden',
          'text-error-emphasis flex gap-1 pt-1 text-xs',
          "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
          'motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-out',
          'data-ending-style:motion-safe:opacity-0 data-starting-style:motion-safe:opacity-0',
          className,
        )}
        {...props}
      />
    </div>
  )
}

type FieldValidityProps = React.ComponentProps<typeof BaseField.Validity>

const FieldValidity: React.FC<FieldValidityProps> = BaseField.Validity

export { Field, FieldLabel, FieldDescription, FieldError, FieldValidity }
export type { FieldProps, FieldLabelProps, FieldDescriptionProps, FieldErrorProps, FieldValidityProps }
