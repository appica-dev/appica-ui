import { cva, type VariantProps } from 'class-variance-authority'
import {
  COLOR_CONTROL_GROUP,
  COLOR_SWATCH_SHAPES,
  COLOR_SWATCH_SIZES,
  colorControlDisabledClasses,
} from '../../internal/color-control'

export const colorSwatchVariants = cva(
  `${COLOR_CONTROL_GROUP} ${colorControlDisabledClasses} relative isolate inline-flex size-[1em] shrink-0 items-center justify-center forced-color-adjust-none [&_svg:not([class*='size-'])]:size-[0.5em]`,
  {
    variants: {
      size: COLOR_SWATCH_SIZES,
      shape: COLOR_SWATCH_SHAPES,
    },
  },
)

export type ColorSwatchPresetSize = NonNullable<VariantProps<typeof colorSwatchVariants>['size']>
export type ColorSwatchShape = NonNullable<VariantProps<typeof colorSwatchVariants>['shape']>
