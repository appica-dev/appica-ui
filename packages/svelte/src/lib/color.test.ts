import { describe, it, expect } from 'vitest'
import {
  type Color,
  convertColor,
  formatChannelValue,
  formatColor,
  getChannelRange,
  getChannelValue,
  getColorSpaceAxes,
  parseColor,
  safeParseColor,
  withChannelValue,
} from './color'

const round = (color: Color, precision = 2) =>
  Object.fromEntries(
    Object.entries(color).map(([key, value]) => [
      key,
      typeof value === 'number' ? Number(value.toFixed(precision)) : value,
    ]),
  )

describe('parseColor', () => {
  it('parses hex in every length', () => {
    expect(parseColor('#f00')).toEqual({ space: 'rgb', red: 255, green: 0, blue: 0, alpha: 1 })
    expect(parseColor('#ff0000')).toEqual({ space: 'rgb', red: 255, green: 0, blue: 0, alpha: 1 })
    expect(parseColor('#ff000080').alpha).toBeCloseTo(0.502, 3)
    expect(parseColor('#f008').alpha).toBeCloseTo(0.533, 3)
  })

  it('parses comma and space separated function syntax alike', () => {
    expect(parseColor('rgb(10, 20, 30)')).toEqual(parseColor('rgb(10 20 30)'))
    expect(parseColor('rgba(10, 20, 30, 0.5)')).toEqual(parseColor('rgb(10 20 30 / 50%)'))
  })

  it('parses hsl, hsb and oklch', () => {
    expect(parseColor('hsl(120, 50%, 40%)')).toEqual({
      space: 'hsl',
      hue: 120,
      saturation: 50,
      lightness: 40,
      alpha: 1,
    })
    expect(parseColor('hsb(120, 50%, 40%)').space).toBe('hsb')
    expect(parseColor('oklch(62.8% 0.26 29.2)')).toEqual({
      space: 'oklch',
      lightness: 62.8,
      chroma: 0.26,
      hue: 29.2,
      alpha: 1,
    })
  })

  it('normalizes hue outside 0-360', () => {
    expect(getChannelValue(parseColor('hsl(-30, 50%, 40%)'), 'hue')).toBe(330)
    expect(getChannelValue(parseColor('hsl(390, 50%, 40%)'), 'hue')).toBe(30)
  })

  it('keeps a hue of exactly 360, which is in range rather than past it', () => {
    // The channel's maximum has to survive a round trip, or a slider that reaches it
    // snaps back to the opposite end the moment the value is written out and reread.
    const wheel = parseColor('hsb(360, 100%, 100%)')
    expect(getChannelValue(wheel, 'hue')).toBe(360)
    expect(getChannelValue(parseColor(formatColor(wheel, 'hsba')), 'hue')).toBe(360)
  })

  it('throws on nonsense, and safeParseColor returns undefined instead', () => {
    expect(() => parseColor('not a color')).toThrow()
    expect(() => parseColor('#fffff')).toThrow()
    expect(safeParseColor('not a color')).toBeUndefined()
  })
})

describe('convertColor', () => {
  it('round-trips primaries through every space', () => {
    for (const hex of ['#ff0000', '#00ff00', '#0000ff', '#123456', '#ffffff', '#000000']) {
      const rgb = parseColor(hex)
      for (const space of ['hsl', 'hsb', 'oklch'] as const) {
        const back = convertColor(convertColor(rgb, space), 'rgb')
        expect(formatColor(back, 'hex')).toBe(hex)
      }
    }
  })

  it('matches known hsl and hsb values', () => {
    expect(round(convertColor(parseColor('#ff0000'), 'hsl'))).toEqual({
      space: 'hsl',
      hue: 0,
      saturation: 100,
      lightness: 50,
      alpha: 1,
    })
    expect(round(convertColor(parseColor('#808080'), 'hsb'))).toEqual({
      space: 'hsb',
      hue: 0,
      saturation: 0,
      brightness: 50.2,
      alpha: 1,
    })
  })

  it('places white and black at the ends of the oklch lightness axis', () => {
    expect(getChannelValue(convertColor(parseColor('#ffffff'), 'oklch'), 'lightness')).toBeCloseTo(100, 1)
    expect(getChannelValue(convertColor(parseColor('#000000'), 'oklch'), 'lightness')).toBeCloseTo(0, 1)
  })

  it('pins hue to zero for grays, so round-trips stay stable', () => {
    expect(getChannelValue(convertColor(parseColor('#808080'), 'oklch'), 'hue')).toBe(0)
  })

  it('preserves alpha across spaces', () => {
    expect(convertColor(parseColor('rgba(255, 0, 0, 0.4)'), 'oklch').alpha).toBe(0.4)
  })
})

describe('formatColor', () => {
  it('picks the shortest css form for the color own space', () => {
    expect(formatColor(parseColor('rgb(1, 2, 3)'))).toBe('rgb(1, 2, 3)')
    expect(formatColor(parseColor('rgba(1, 2, 3, 0.5)'))).toBe('rgba(1, 2, 3, 0.5)')
    expect(formatColor(parseColor('hsl(120, 50%, 40%)'))).toBe('hsl(120, 50%, 40%)')
  })

  it('borrows hsl syntax for hsb, which has no css form', () => {
    expect(formatColor(parseColor('hsb(120, 100%, 100%)'))).toBe('hsl(120, 100%, 50%)')
  })

  it('writes oklch with slash alpha', () => {
    expect(formatColor(parseColor('oklch(62.8% 0.26 29.2 / 0.5)'))).toBe('oklch(62.8% 0.26 29.2 / 0.5)')
  })

  it('converts into the requested format', () => {
    expect(formatColor(parseColor('hsl(0, 100%, 50%)'), 'hex')).toBe('#ff0000')
    expect(formatColor(parseColor('#ff000080'), 'hexa')).toBe('#ff000080')
  })
})

describe('channels', () => {
  it('clamps to the channel range on write', () => {
    expect(getChannelValue(withChannelValue(parseColor('#000'), 'red', 999), 'red')).toBe(255)
    expect(getChannelValue(withChannelValue(parseColor('hsl(0, 0%, 0%)'), 'saturation', -5), 'saturation')).toBe(0)
  })

  it('rejects channels outside the color space', () => {
    expect(() => getChannelValue(parseColor('#000'), 'hue')).toThrow()
    expect(() => getChannelRange('rgb', 'chroma')).toThrow()
  })

  it('formats values with the unit of the channel', () => {
    const color = parseColor('hsl(210, 40%, 60%)')
    expect(formatChannelValue(color, 'hue')).toBe('210°')
    expect(formatChannelValue(color, 'saturation')).toBe('40%')
    expect(formatChannelValue(parseColor('rgb(10, 20, 30)'), 'red')).toBe('10')
    expect(formatChannelValue(parseColor('oklch(50% 0.1 30)'), 'chroma')).toBe('0.100')
  })

  it('fills unspecified axes with the channels left free', () => {
    expect(getColorSpaceAxes('hsb', { xChannel: 'saturation', yChannel: 'brightness' })).toEqual({
      xChannel: 'saturation',
      yChannel: 'brightness',
      zChannel: 'hue',
    })
    expect(getColorSpaceAxes('hsb', { yChannel: 'brightness' })).toEqual({
      xChannel: 'hue',
      yChannel: 'brightness',
      zChannel: 'saturation',
    })
    expect(getColorSpaceAxes('rgb')).toEqual({ xChannel: 'red', yChannel: 'green', zChannel: 'blue' })
  })
})

describe('out-of-gamut oklch', () => {
  it('converts the way a browser paints it, by clipping', () => {
    // Chrome clips oklch() per channel rather than reducing chroma, so matching it
    // keeps a picked color identical to the one the emitted string renders as.
    const clipped = convertColor(parseColor('oklch(85% 0.25 30)'), 'rgb')
    expect(formatColor(clipped, 'rgb')).toBe('rgb(255, 124, 98)')
  })
})
