import { cva, type VariantProps } from 'class-variance-authority'

export const avatarVariants = cva(
  "relative flex size-[1em] shrink-0 items-center justify-center bg-background-strong text-center font-medium text-foreground-emphasis [&_svg:not([class*='size-'])]:size-[0.5em]",
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
    },
  },
)

export type AvatarPresetSize = NonNullable<VariantProps<typeof avatarVariants>['size']>
export type AvatarShape = NonNullable<VariantProps<typeof avatarVariants>['shape']>
