import { cva, type VariantProps } from 'class-variance-authority'

export const thumbnailVariants = cva(
  "relative inline-flex size-[1em] shrink-0 items-center justify-center overflow-hidden [&_svg:not([class*='size-'])]:size-[0.5em]",
  {
    variants: {
      size: {
        '2xs': 'text-[1.25rem]',
        xs: 'text-[1.5rem]',
        sm: 'text-[2rem]',
        md: 'text-[2.5rem]',
        lg: 'text-[3rem]',
        xl: 'text-[4rem]',
        '2xl': 'text-[5rem]',
      },
      shape: {
        rounded: 'rounded-[calc(tan(atan2(var(--radius-md),2.5rem))*100%)]',
        circle: 'rounded-full',
      },
      variant: {
        image: 'bg-background-muted',
        'icon-soft': 'bg-background-muted text-foreground-intense',
        'icon-outline': 'bg-background text-foreground-intense border border-border',
        'icon-primary': 'bg-primary text-primary-foreground',
        'icon-primary-outline': 'text-primary border border-primary',
        'icon-secondary': 'bg-secondary-muted text-secondary-foreground',
        'icon-error': 'bg-error-muted text-error-foreground',
        'icon-success': 'bg-success-muted text-success-foreground',
        'icon-warning': 'bg-warning-muted text-warning-foreground',
        'icon-info': 'bg-info-muted text-info-foreground',
      },
    },
  },
)

export type ThumbnailPresetSize = NonNullable<VariantProps<typeof thumbnailVariants>['size']>
export type ThumbnailShape = NonNullable<VariantProps<typeof thumbnailVariants>['shape']>
export type ThumbnailVariant = NonNullable<VariantProps<typeof thumbnailVariants>['variant']>
