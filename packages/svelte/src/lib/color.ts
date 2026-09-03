// Color model shared by the color components (ColorArea, ColorSlider, ColorSwatch,
// ColorSwatchPicker, ColorPicker). A Color is a plain, serializable object
// rather than a class instance, so it can cross the RSC boundary and survive
// `structuredClone` - a class would not.
//
// The matrix conversions live in ../color-math, which stays free of objects and of
// this module's clamping rules.

import { linearRgbToOklab, oklchToSrgb, srgbToLinear } from '../internal/color-math'

/** A color space a `Color` can be expressed in. */
export type ColorSpace = 'rgb' | 'hsl' | 'hsb' | 'oklch'

/** A single adjustable component of a color. */
export type ColorChannel =
  'red' | 'green' | 'blue' | 'hue' | 'saturation' | 'lightness' | 'brightness' | 'chroma' | 'alpha'

/** A string form `formatColor` can produce and `parseColor` can read back. */
export type ColorFormat = 'hex' | 'hexa' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsb' | 'hsba' | 'oklch' | 'oklcha'

/** sRGB color. Channels are 0-255, alpha is 0-1. */
export interface RgbColor {
  space: 'rgb'
  red: number
  green: number
  blue: number
  alpha: number
}

/** HSL color. Hue is 0-360, saturation and lightness are 0-100, alpha is 0-1. */
export interface HslColor {
  space: 'hsl'
  hue: number
  saturation: number
  lightness: number
  alpha: number
}

/** HSB (a.k.a. HSV) color. Hue is 0-360, saturation and brightness are 0-100, alpha is 0-1. */
export interface HsbColor {
  space: 'hsb'
  hue: number
  saturation: number
  brightness: number
  alpha: number
}

/** OKLCh color. Lightness is 0-100, chroma is 0-0.4, hue is 0-360, alpha is 0-1. */
export interface OklchColor {
  space: 'oklch'
  lightness: number
  chroma: number
  hue: number
  alpha: number
}

/** A color value in one of the supported color spaces. */
export type Color = RgbColor | HslColor | HsbColor | OklchColor

/** The bounds and increments of a channel within a given color space. */
export interface ColorChannelRange {
  /** Lowest value the channel accepts. */
  minValue: number
  /** Highest value the channel accepts. */
  maxValue: number
  /** Increment applied by an arrow key. */
  step: number
  /** Increment applied by Page Up, Page Down, or a shifted arrow key. */
  pageSize: number
}

/** The three channels of a color space, mapped onto the axes of a color area. */
export interface ColorAxes {
  /** Channel driven by the horizontal axis. */
  xChannel: ColorChannel
  /** Channel driven by the vertical axis. */
  yChannel: ColorChannel
  /** Channel held constant, and so not represented by either axis. */
  zChannel: ColorChannel
}

const CHANNELS: Record<ColorSpace, [ColorChannel, ColorChannel, ColorChannel]> = {
  rgb: ['red', 'green', 'blue'],
  hsl: ['hue', 'saturation', 'lightness'],
  hsb: ['hue', 'saturation', 'brightness'],
  oklch: ['lightness', 'chroma', 'hue'],
}

const RANGES: Record<ColorSpace, Partial<Record<ColorChannel, ColorChannelRange>>> = {
  rgb: {
    red: { minValue: 0, maxValue: 255, step: 1, pageSize: 17 },
    green: { minValue: 0, maxValue: 255, step: 1, pageSize: 17 },
    blue: { minValue: 0, maxValue: 255, step: 1, pageSize: 17 },
  },
  hsl: {
    hue: { minValue: 0, maxValue: 360, step: 1, pageSize: 15 },
    saturation: { minValue: 0, maxValue: 100, step: 1, pageSize: 10 },
    lightness: { minValue: 0, maxValue: 100, step: 1, pageSize: 10 },
  },
  hsb: {
    hue: { minValue: 0, maxValue: 360, step: 1, pageSize: 15 },
    saturation: { minValue: 0, maxValue: 100, step: 1, pageSize: 10 },
    brightness: { minValue: 0, maxValue: 100, step: 1, pageSize: 10 },
  },
  oklch: {
    lightness: { minValue: 0, maxValue: 100, step: 1, pageSize: 10 },
    chroma: { minValue: 0, maxValue: 0.4, step: 0.005, pageSize: 0.05 },
    hue: { minValue: 0, maxValue: 360, step: 1, pageSize: 15 },
  },
}

const ALPHA_RANGE: ColorChannelRange = { minValue: 0, maxValue: 1, step: 0.01, pageSize: 0.1 }

/** Returns the three channels that define `space`, in canonical order. */
export function getColorChannels(space: ColorSpace): [ColorChannel, ColorChannel, ColorChannel] {
  return CHANNELS[space]
}

/** Returns the bounds and increments of `channel` within `space`. */
export function getChannelRange(space: ColorSpace, channel: ColorChannel): ColorChannelRange {
  if (channel === 'alpha') return ALPHA_RANGE
  const range = RANGES[space][channel]
  if (!range) throw new Error(`Channel "${channel}" is not part of the ${space} color space`)
  return range
}

/** Reads a single channel off a color. Throws if the channel is not in the color's space. */
export function getChannelValue(color: Color, channel: ColorChannel): number {
  const value = (color as unknown as Record<string, number>)[channel]
  if (typeof value !== 'number') {
    throw new Error(`Channel "${channel}" is not part of the ${color.space} color space`)
  }
  return value
}

/** Returns a copy of `color` with `channel` clamped into range and set to `value`. */
export function withChannelValue(color: Color, channel: ColorChannel, value: number): Color {
  const { minValue, maxValue } = getChannelRange(color.space, channel)
  return { ...color, [channel]: clamp(value, minValue, maxValue) } as Color
}

/**
 * Resolves the x, y and z channels of a color area. Unspecified axes fall back to
 * the first channels of `space` that are still free.
 */
export function getColorSpaceAxes(space: ColorSpace, axes: Partial<Omit<ColorAxes, 'zChannel'>> = {}): ColorAxes {
  const channels = CHANNELS[space]
  const xChannel = axes.xChannel ?? channels.find((c) => c !== axes.yChannel)!
  const yChannel = axes.yChannel ?? channels.find((c) => c !== xChannel)!
  const zChannel = channels.find((c) => c !== xChannel && c !== yChannel)!
  return { xChannel, yChannel, zChannel }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

// Guarded so an in-range hue comes back bit for bit - the modulo round trip adds
// float error that would surface in parsed values. 360 is inside the range too: it is
// the hue channel's documented maximum, so a slider that reaches it has to be able to
// write it out and read it back, even though it paints the same color as 0.
function mod360(hue: number) {
  if (hue >= 0 && hue <= 360) return hue
  return ((hue % 360) + 360) % 360
}

function rgbToHsb(color: RgbColor): HsbColor {
  const r = color.red / 255
  const g = color.green / 255
  const b = color.blue / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let hue = 0
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6
    else if (max === g) hue = (b - r) / delta + 2
    else hue = (r - g) / delta + 4
  }

  return {
    space: 'hsb',
    hue: mod360(hue * 60),
    saturation: max === 0 ? 0 : (delta / max) * 100,
    brightness: max * 100,
    alpha: color.alpha,
  }
}

function hsbToRgb(color: HsbColor): RgbColor {
  const s = color.saturation / 100
  const v = color.brightness / 100
  const c = v * s
  const h = color.hue / 60
  const x = c * (1 - Math.abs((h % 2) - 1))
  const m = v - c
  const [r, g, b] = sector(h, c, x)
  return { space: 'rgb', red: (r + m) * 255, green: (g + m) * 255, blue: (b + m) * 255, alpha: color.alpha }
}

function rgbToHsl(color: RgbColor): HslColor {
  const hsb = rgbToHsb(color)
  const v = hsb.brightness / 100
  const s = hsb.saturation / 100
  const l = v * (1 - s / 2)
  return {
    space: 'hsl',
    hue: hsb.hue,
    saturation: l === 0 || l === 1 ? 0 : ((v - l) / Math.min(l, 1 - l)) * 100,
    lightness: l * 100,
    alpha: color.alpha,
  }
}

function hslToRgb(color: HslColor): RgbColor {
  const s = color.saturation / 100
  const l = color.lightness / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const h = color.hue / 60
  const x = c * (1 - Math.abs((h % 2) - 1))
  const m = l - c / 2
  const [r, g, b] = sector(h, c, x)
  return { space: 'rgb', red: (r + m) * 255, green: (g + m) * 255, blue: (b + m) * 255, alpha: color.alpha }
}

function sector(h: number, c: number, x: number): [number, number, number] {
  if (h < 1) return [c, x, 0]
  if (h < 2) return [x, c, 0]
  if (h < 3) return [0, c, x]
  if (h < 4) return [0, x, c]
  if (h < 5) return [x, 0, c]
  return [c, 0, x]
}

function rgbToOklch(color: RgbColor): OklchColor {
  const [L, a, b] = linearRgbToOklab(
    srgbToLinear(color.red / 255),
    srgbToLinear(color.green / 255),
    srgbToLinear(color.blue / 255),
  )
  const chroma = Math.sqrt(a * a + b * b)
  return {
    space: 'oklch',
    lightness: L * 100,
    chroma,
    // Hue is meaningless at zero chroma and float noise there swings wildly, so pin
    // it to keep round trips through gray stable.
    hue: chroma < 1e-6 ? 0 : mod360((Math.atan2(b, a) * 180) / Math.PI),
    alpha: color.alpha,
  }
}

function oklchToRgb(color: OklchColor): RgbColor {
  const [r, g, b] = oklchToSrgb(color.lightness / 100, color.chroma, color.hue)
  return {
    space: 'rgb',
    red: clamp(r, 0, 1) * 255,
    green: clamp(g, 0, 1) * 255,
    blue: clamp(b, 0, 1) * 255,
    alpha: color.alpha,
  }
}

function toRgb(color: Color): RgbColor {
  switch (color.space) {
    case 'rgb':
      return color
    case 'hsl':
      return hslToRgb(color)
    case 'hsb':
      return hsbToRgb(color)
    case 'oklch':
      return oklchToRgb(color)
  }
}

/** Converts `color` into `space`. Returns the same object when it is already there. */
export function convertColor<S extends ColorSpace>(color: Color, space: S): Extract<Color, { space: S }> {
  if (color.space === space) return color as Extract<Color, { space: S }>
  const rgb = toRgb(color)
  switch (space) {
    case 'rgb':
      return rgb as Extract<Color, { space: S }>
    case 'hsl':
      return rgbToHsl(rgb) as Extract<Color, { space: S }>
    case 'hsb':
      return rgbToHsb(rgb) as Extract<Color, { space: S }>
    default:
      return rgbToOklch(rgb) as Extract<Color, { space: S }>
  }
}

const CHANNEL_NAMES: Record<ColorChannel, string> = {
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
  hue: 'Hue',
  saturation: 'Saturation',
  lightness: 'Lightness',
  brightness: 'Brightness',
  chroma: 'Chroma',
  alpha: 'Alpha',
}

/** Returns the English display name of `channel`, for labels and value text. */
export function getChannelName(channel: ColorChannel): string {
  return CHANNEL_NAMES[channel]
}

/** Formats a channel value for display, with the unit the channel is measured in. */
export function formatChannelValue(color: Color, channel: ColorChannel): string {
  const value = getChannelValue(color, channel)
  if (channel === 'hue') return `${Math.round(value)}°`
  if (channel === 'chroma') return value.toFixed(3)
  if (channel === 'alpha') return `${Math.round(value * 100)}%`
  if (color.space === 'rgb') return `${Math.round(value)}`
  return `${Math.round(value)}%`
}

const HEX_RE = /^#([0-9a-f]{3,8})$/i
const FUNC_RE = /^(rgba?|hsla?|hsba?|hsva?|oklch)\(([^)]*)\)$/i

function parseComponent(raw: string, scale: number, max: number): number {
  const percent = raw.endsWith('%')
  const value = Number.parseFloat(percent ? raw.slice(0, -1) : raw)
  if (Number.isNaN(value)) throw new Error(`Invalid color component "${raw}"`)
  return clamp(percent ? (value / 100) * scale : value, 0, max)
}

function parseAlpha(raw: string | undefined): number {
  if (raw == null || raw === '' || raw === 'none') return 1
  return parseComponent(raw, 1, 1)
}

/**
 * Parses a CSS color string into a `Color`. Accepts hex (3, 4, 6 or 8 digits),
 * `rgb()`, `hsl()`, `oklch()` in both comma and space separated forms, plus the
 * non-CSS `hsb()` used by design tools. Throws on anything else.
 */
export function parseColor(value: string): Color {
  const input = value.trim()

  const hex = HEX_RE.exec(input)
  if (hex) {
    const digits = hex[1] ?? ''
    if (digits.length !== 3 && digits.length !== 4 && digits.length !== 6 && digits.length !== 8) {
      throw new Error(`Invalid hex color "${value}"`)
    }
    const expand = digits.length <= 4
    const size = expand ? 1 : 2
    const channel = (i: number) => {
      const slice = digits.slice(i * size, i * size + size)
      return Number.parseInt(expand ? slice + slice : slice, 16)
    }
    return {
      space: 'rgb',
      red: channel(0),
      green: channel(1),
      blue: channel(2),
      alpha: digits.length === 4 || digits.length === 8 ? channel(3) / 255 : 1,
    }
  }

  const func = FUNC_RE.exec(input)
  if (func) {
    const name = (func[1] ?? '').toLowerCase()
    const parts = (func[2] ?? '')
      .replace('/', ' ')
      .split(/[\s,]+/)
      .filter(Boolean)
    const [first, second, third, fourth] = parts
    if (first == null || second == null || third == null) throw new Error(`Invalid color "${value}"`)
    const alpha = parseAlpha(fourth)

    if (name === 'rgb' || name === 'rgba') {
      return {
        space: 'rgb',
        red: parseComponent(first, 255, 255),
        green: parseComponent(second, 255, 255),
        blue: parseComponent(third, 255, 255),
        alpha,
      }
    }
    if (name === 'hsl' || name === 'hsla') {
      return {
        space: 'hsl',
        hue: mod360(Number.parseFloat(first)),
        saturation: parseComponent(second, 100, 100),
        lightness: parseComponent(third, 100, 100),
        alpha,
      }
    }
    if (name === 'oklch') {
      return {
        space: 'oklch',
        lightness: parseComponent(first, 100, 100),
        chroma: parseComponent(second, 0.4, Number.POSITIVE_INFINITY),
        hue: mod360(Number.parseFloat(third)),
        alpha,
      }
    }
    return {
      space: 'hsb',
      hue: mod360(Number.parseFloat(first)),
      saturation: parseComponent(second, 100, 100),
      brightness: parseComponent(third, 100, 100),
      alpha,
    }
  }

  throw new Error(`Invalid color "${value}"`)
}

/** Parses `value` into a `Color`, returning `undefined` instead of throwing on bad input. */
export function safeParseColor(value: string): Color | undefined {
  try {
    return parseColor(value)
  } catch {
    return undefined
  }
}

function round(value: number, precision = 0) {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function hexPair(value: number) {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')
}

/**
 * Serializes `color` to a CSS string. `'css'` picks the shortest form the browser
 * understands for the color's own space, which is what you want for a `background`.
 */
export function formatColor(color: Color, format: ColorFormat | 'css' = 'css'): string {
  if (format === 'css') {
    const space = color.space === 'hsb' ? 'hsl' : color.space
    return formatColor(color, (color.alpha < 1 ? `${space}a` : space) as ColorFormat)
  }

  if (format === 'hex' || format === 'hexa') {
    const rgb = convertColor(color, 'rgb')
    const base = `#${hexPair(rgb.red)}${hexPair(rgb.green)}${hexPair(rgb.blue)}`
    return format === 'hexa' ? `${base}${hexPair(rgb.alpha * 255)}` : base
  }

  const withAlpha = format.endsWith('a')
  const alpha = round(color.alpha, 2)

  if (format === 'rgb' || format === 'rgba') {
    const { red, green, blue } = convertColor(color, 'rgb')
    const channels = `${round(red)}, ${round(green)}, ${round(blue)}`
    return withAlpha ? `rgba(${channels}, ${alpha})` : `rgb(${channels})`
  }
  if (format === 'hsl' || format === 'hsla') {
    const { hue, saturation, lightness } = convertColor(color, 'hsl')
    const channels = `${round(hue, 2)}, ${round(saturation, 2)}%, ${round(lightness, 2)}%`
    return withAlpha ? `hsla(${channels}, ${alpha})` : `hsl(${channels})`
  }
  if (format === 'hsb' || format === 'hsba') {
    const { hue, saturation, brightness } = convertColor(color, 'hsb')
    const channels = `${round(hue, 2)}, ${round(saturation, 2)}%, ${round(brightness, 2)}%`
    return withAlpha ? `hsba(${channels}, ${alpha})` : `hsb(${channels})`
  }

  const { lightness, chroma, hue } = convertColor(color, 'oklch')
  const channels = `${round(lightness, 2)}% ${round(chroma, 4)} ${round(hue, 2)}`
  return withAlpha ? `oklch(${channels} / ${alpha})` : `oklch(${channels})`
}
