import { cva, type VariantProps } from 'class-variance-authority'
import { COLOR_SWATCH_SHAPES, COLOR_SWATCH_SIZES } from '../../internal/color-control'

export const colorSwatchPickerVariants = cva('relative isolate flex gap-1', {
  variants: {
    size: COLOR_SWATCH_SIZES,
    layout: {
      grid: 'flex-row flex-wrap',
      stack: 'flex-col',
    },
  },
})

export const colorSwatchPickerItemVariants = cva(
  'outline-ring relative flex size-[1em] shrink-0 transform-gpu cursor-pointer items-center justify-center focus-visible:outline-3 motion-safe:transition motion-safe:duration-250 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)] motion-safe:active:translate-y-px motion-safe:active:scale-90 motion-safe:active:duration-100 motion-safe:active:ease-in-out data-disabled:pointer-events-none data-disabled:cursor-default',
  { variants: { shape: COLOR_SWATCH_SHAPES } },
)

export type ColorSwatchPickerLayout = 'grid' | 'stack'
export type ColorSwatchPickerSize = NonNullable<VariantProps<typeof colorSwatchPickerVariants>['size']>
export type ColorSwatchPickerShape = NonNullable<VariantProps<typeof colorSwatchPickerItemVariants>['shape']>
