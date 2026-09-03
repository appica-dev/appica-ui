import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'

export const alertVariants = cva(
  cn(
    'group/alert relative rounded-xl border p-5 text-foreground backdrop-blur-xl',
    'grid w-full items-start',
    "[grid-template-columns:auto_1fr_auto] [grid-template-areas:'icon_title_close'_'._description_.'_'._actions_actions']",
    '@min-[460px]:data-[layout=inline]:items-center',
    '@min-[460px]:data-[layout=inline]:[grid-template-columns:auto_auto_1fr_auto_auto]',
    "@min-[460px]:data-[layout=inline]:[grid-template-areas:'icon_title_description_actions_close']",
  ),
  {
    variants: {
      variant: {
        default: 'bg-background border-border',
        primary: 'bg-primary-subtle border-primary-soft',
        secondary: 'bg-secondary-subtle border-secondary-soft',
        error: 'bg-error-subtle border-error-soft',
        success: 'bg-success-subtle border-success-soft',
        warning: 'bg-warning-subtle border-warning-soft',
        info: 'bg-info-subtle border-info-soft',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type AlertVariant = NonNullable<VariantProps<typeof alertVariants>['variant']>

export const alertIconColor: Record<AlertVariant, string> = {
  default: 'text-foreground-intense',
  primary: 'text-primary',
  secondary: 'text-secondary-emphasis',
  error: 'text-error-emphasis',
  success: 'text-success-emphasis',
  warning: 'text-warning-emphasis',
  info: 'text-info-emphasis',
}
