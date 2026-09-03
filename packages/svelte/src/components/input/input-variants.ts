import { cva } from 'class-variance-authority'
import { cn } from '../../internal/utils'

const inputVariants = cva(
  'w-full border text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        outline:
          'bg-background border-border-strong hover:not-focus:not-focus-visible:not-has-focus:not-has-focus-visible:not-data-popup-open:not-has-data-popup-open:not-data-pressed:not-has-data-pressed:not-data-invalid:not-has-data-invalid:border-border-emphasis',
        soft: 'bg-background-muted border-transparent hover:not-focus:not-focus-visible:not-has-focus:not-has-focus-visible:not-data-popup-open:not-has-data-popup-open:not-data-pressed:not-has-data-pressed:not-data-invalid:not-has-data-invalid:border-border-strong',
      },
      size: {
        sm: "h-8 px-3 text-xs pointer-coarse:text-base rounded-sm gap-1.5 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
        md: "h-10 px-3.5 text-sm pointer-coarse:text-base rounded-md gap-2 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
        lg: "h-12 px-4 text-base rounded-lg gap-2 [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
      },
      state: {
        self: cn(
          'focus-visible:ring-3 focus-visible:ring-ring-input focus-visible:border-transparent focus-visible:bg-background',
          'data-popup-open:ring-3 data-popup-open:ring-ring-input data-popup-open:border-transparent data-popup-open:bg-background',
          'data-pressed:ring-3 data-pressed:ring-ring-input data-pressed:border-transparent data-pressed:bg-background',
          'data-invalid:bg-error-subtle data-invalid:border-error',
          'data-invalid:focus-visible:border-transparent data-invalid:focus-visible:ring-ring-error data-invalid:focus-visible:bg-background',
          'data-invalid:data-popup-open:border-transparent data-invalid:data-popup-open:ring-ring-error data-invalid:data-popup-open:bg-background',
          'data-invalid:data-pressed:border-transparent data-invalid:data-pressed:ring-ring-error data-invalid:data-pressed:bg-background',
          'data-disabled:border-border-strong! data-disabled:bg-background-subtle! data-disabled:cursor-not-allowed data-disabled:border-dashed data-disabled:opacity-disabled',
        ),
        within: cn(
          'flex items-center',
          'has-focus:ring-[3px] has-focus:ring-ring-input has-focus:border-transparent has-focus:bg-background',
          'has-data-popup-open:ring-3 has-data-popup-open:ring-ring-input has-data-popup-open:border-transparent has-data-popup-open:bg-background',
          'has-data-pressed:ring-3 has-data-pressed:ring-ring-input has-data-pressed:border-transparent has-data-pressed:bg-background',
          'data-invalid:bg-error-subtle data-invalid:border-error data-invalid:has-focus:border-transparent data-invalid:has-focus:ring-ring-error data-invalid:has-focus:bg-background',
          'data-invalid:has-data-popup-open:border-transparent data-invalid:has-data-popup-open:ring-ring-error data-invalid:has-data-popup-open:bg-background',
          'data-invalid:has-data-pressed:border-transparent data-invalid:has-data-pressed:ring-ring-error data-invalid:has-data-pressed:bg-background',
          'has-data-invalid:bg-error-subtle has-data-invalid:border-error has-data-invalid:has-focus:border-transparent has-data-invalid:has-focus:ring-ring-error has-data-invalid:has-focus:bg-background',
          'has-data-invalid:has-data-popup-open:border-transparent has-data-invalid:has-data-popup-open:ring-ring-error has-data-invalid:has-data-popup-open:bg-background',
          'has-data-invalid:has-data-pressed:border-transparent has-data-invalid:has-data-pressed:ring-ring-error has-data-invalid:has-data-pressed:bg-background',
          'has-[input:disabled]:border-border-strong! has-[input:disabled]:bg-background-subtle! has-[input:disabled]:cursor-not-allowed has-[input:disabled]:border-dashed has-[input:disabled]:opacity-disabled',
        ),
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
      state: 'self',
    },
  },
)

export { inputVariants }
