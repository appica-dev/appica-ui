// Shared plumbing for the color components (ColorArea, ColorSlider, ColorSwatch,
// ColorSwatchPicker, ColorPicker). Keeping the border, the disabled treatment, the thumb, the
// size ladder and the snapping here is what stops them from drifting apart visually.
// Internal: nothing here is re-exported from the package.

import {
  type Color,
  type ColorChannel,
  type ColorSpace,
  convertColor,
  getColorChannels,
  parseColor,
} from '../lib/color'

/** Group name both control roots carry, so the shared thumb can react to either. */
export const COLOR_CONTROL_GROUP = 'group/color-control'

/**
 * Inert, dimmed and flat-filled: the disabled treatment every color component shares.
 * The flat fill only shows because the components withhold their inline background
 * when disabled, leaving this class to paint.
 */
export const colorControlDisabledClasses =
  'data-disabled:pointer-events-none data-disabled:opacity-disabled data-disabled:bg-background-muted'

/**
 * That treatment plus the focus ring and gesture guards, for the two controls a
 * pointer drags. A swatch takes the disabled classes alone: `touch-none` there would
 * cost a palette its touch scrolling.
 */
export const colorControlRootClasses = `outline-ring relative isolate touch-none select-none forced-color-adjust-none outline-offset-2 has-focus-visible:outline-3 ${colorControlDisabledClasses}`

/**
 * Hairline over the color, so a pale one still reads as a bounded surface, and
 * the dashed outline that replaces it when disabled. Both live on this overlay rather
 * than the root: a border on the root would shrink the padding box the thumb is
 * positioned against, nudging it a pixel the moment the control is disabled. The
 * border color is inert without a width, so only the width and style are scoped.
 */
export const colorControlSurfaceClasses =
  'ring-border border-border-strong pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset group-data-disabled/color-control:border group-data-disabled/color-control:border-dashed group-data-disabled/color-control:ring-0'

/**
 * The thumb, minus positioning. Its own position is deliberately not transitioned -
 * easing it toward the pointer reads as lag. Only the press scale animates, and
 * `translate` and `scale` are separate properties, so centering the thumb and scaling
 * it never contend for `transform`.
 *
 * The white rim carries a faint dark ring on each side, so it stays legible over any
 * point of the gradient in either theme, including a white one.
 */
export const colorControlThumbClasses =
  'absolute z-10 size-4.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-3 border-white ring-1 ring-black/20 inset-ring-1 inset-ring-black/20 rtl:translate-x-1/2 motion-safe:transition-[scale] motion-safe:duration-150 motion-safe:ease-out group-active/color-control:scale-125 group-data-dragging/color-control:scale-125 data-disabled:bg-background-muted'

// Backdrop for anything translucent - an alpha track, a swatch below full opacity -
// so the transparency shows rather than being implied. Image and tile size stay
// separate: `background-image` rejects the `0 0 / size` shorthand outright, taking
// the whole declaration with it.
export const colorControlCheckerboard =
  'repeating-conic-gradient(var(--background-strong) 0% 25%, var(--background) 0% 50%)'

export const colorControlCheckerboardSize = '0.75rem 0.75rem'

/**
 * The swatch ladder: Avatar's, shifted one step down. A swatch is read beside a
 * value rather than looked at, so it needs 16px more than it needs 80px. Every name
 * the two scales share keeps its pixel size. Driven through `font-size` so a `1em`
 * box, its corner and anything nested scale from one declaration.
 */
export const COLOR_SWATCH_SIZES = {
  '3xs': 'text-[1rem]',
  '2xs': 'text-[1.25rem]',
  xs: 'text-[1.5rem]',
  sm: 'text-[2rem]',
  md: 'text-[2.5rem]',
  lg: 'text-[3rem]',
  xl: 'text-[4rem]',
} as const

/** Corner of a swatch and of anything drawn around one, as a share of the box. */
export const COLOR_SWATCH_SHAPES = {
  rounded: 'rounded-[calc(tan(atan2(var(--radius-md),2.5rem))*100%)]',
  circle: 'rounded-full',
} as const

const HUE_NAMES: [number, string][] = [
  [15, 'red'],
  [45, 'orange'],
  [70, 'yellow'],
  [100, 'lime'],
  [150, 'green'],
  [175, 'teal'],
  [200, 'cyan'],
  [240, 'blue'],
  [270, 'indigo'],
  [300, 'purple'],
  [330, 'magenta'],
  [345, 'pink'],
]

/**
 * An English description of a color, for a swatch's accessible name. A hex string is
 * announced digit by digit, which tells a screen reader user nothing about the color;
 * "dark vivid blue" does.
 */
export function describeColor(color: Color): string {
  const { hue, saturation, lightness, alpha } = convertColor(color, 'hsl')
  if (alpha === 0) return 'transparent'
  const opacity = alpha < 1 ? `, ${Math.round(alpha * 100)}% opacity` : ''

  if (lightness < 4) return `black${opacity}`
  if (lightness > 96) return `white${opacity}`
  if (saturation < 10) {
    return `${lightness < 35 ? 'dark gray' : lightness > 70 ? 'light gray' : 'gray'}${opacity}`
  }

  const name = HUE_NAMES.find(([max]) => hue < max)?.[1] ?? 'red'
  const tone =
    lightness < 25
      ? 'very dark '
      : lightness < 42
        ? 'dark '
        : lightness > 82
          ? 'very light '
          : lightness > 65
            ? 'light '
            : ''
  const vividness = saturation < 30 ? 'muted ' : saturation > 85 ? 'vivid ' : ''
  return `${tone}${vividness}${name}${opacity}`
}

/** Spaces a control can plot. Every point of these is a distinct color. */
export type ColorControlSpace = Extract<ColorSpace, 'rgb' | 'hsl' | 'hsb'>

export const COLOR_CONTROL_SPACES: ColorControlSpace[] = ['rgb', 'hsl', 'hsb']

/** Rounds to the nearest step, clamped, without the float dust `%` would leave. */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = min + Math.round((value - min) / step) * step
  const decimals = (String(step).split('.')[1] ?? '').length
  return Math.min(Math.max(Number(snapped.toFixed(decimals)), min), max)
}

/** Parses a string value, or passes a `Color` through untouched. */
export function normalizeColor(value: Color | string): Color {
  return typeof value === 'string' ? parseColor(value) : value
}

// Space a channel belongs to when the value's own can't carry it. Hue and saturation
// exist in both HSL and HSB; HSB is the pairing a picker is usually built from.
const CHANNEL_SPACE: Partial<Record<ColorChannel, ColorControlSpace>> = {
  red: 'rgb',
  green: 'rgb',
  blue: 'rgb',
  hue: 'hsb',
  saturation: 'hsb',
  brightness: 'hsb',
  lightness: 'hsl',
}

/**
 * Picks the space a control works in: the value's own whenever it carries the
 * channel, otherwise the channel's home space. Preferring the value's space is what
 * lets an area and a slider share one color without converting it back and forth.
 */
export function resolveControlSpace(
  valueSpace: ColorSpace,
  channel: ColorChannel | undefined,
  requested?: ColorControlSpace,
): ColorControlSpace {
  if (requested) return requested
  // Alpha rides along with every space, so it never forces a conversion.
  const carries = (space: ColorControlSpace) =>
    channel == null || channel === 'alpha' || getColorChannels(space).includes(channel)
  const own = COLOR_CONTROL_SPACES.find((space) => space === valueSpace)
  if (own && carries(own)) return own
  return (channel && CHANNEL_SPACE[channel]) ?? 'rgb'
}
