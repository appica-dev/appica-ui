import { cva, type VariantProps } from 'class-variance-authority'

export const chipSizeVariants = cva('', {
  variants: {
    size: {
      sm: "h-6 gap-0.75 rounded-xs px-2 text-xs has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3.5",
      md: "h-8 gap-1 rounded-sm px-3 text-sm has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2 [&_svg:not([class*='size-'])]:size-4",
      lg: "h-10 gap-1.25 rounded-md px-3.5 text-base has-data-[icon=end]:pe-2.5 has-data-[icon=start]:ps-2.5 [&_svg:not([class*='size-'])]:size-4.5",
    },
  },
  defaultVariants: { size: 'md' },
})

export type ChipVariant = 'soft' | 'outline' | 'primary' | 'secondary' | 'destructive'
export type ChipSize = NonNullable<VariantProps<typeof chipSizeVariants>['size']>

export const closeIconSize: Record<ChipSize, string> = {
  sm: 'size-3',
  md: 'size-3.5',
  lg: 'size-4',
}
