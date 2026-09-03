export interface PathPoint {
  x: number
  y: number
  leftFrac: number
  topFrac: number
}

export function getExtent(data: number[]): [number, number] {
  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < data.length; i++) {
    const v = data[i]!
    if (v < min) min = v
    if (v > max) max = v
  }
  return [min, max]
}

export function buildLinePath(points: PathPoint[], smoothing: number): string {
  if (points.length === 0) return ''
  let d = `M ${points[0]!.x} ${points[0]!.y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i]!
    const p2 = points[i + 1]!
    const p0 = points[i - 1] ?? p1
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * smoothing
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * smoothing
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * smoothing
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * smoothing
    d += ` C ${round(cp1x)} ${round(cp1y)}, ${round(cp2x)} ${round(cp2y)}, ${p2.x} ${p2.y}`
  }
  return d
}

const numberFormatCache = new Map<string, Intl.NumberFormat>()

export function getNumberFormat(format?: Intl.NumberFormatOptions, locale?: Intl.LocalesArgument): Intl.NumberFormat {
  const cacheKey = JSON.stringify([locale ?? '', format ?? {}])
  let formatter = numberFormatCache.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, format)
    numberFormatCache.set(cacheKey, formatter)
  }
  return formatter
}

export function formatNumber(value: number, format?: Intl.NumberFormatOptions, locale?: Intl.LocalesArgument): string {
  if (!Number.isFinite(value)) return ''
  return getNumberFormat(format, locale).format(value)
}

export const round = (n: number) => Math.round(n * 100) / 100
export const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export function readTextDirection(el: HTMLElement | undefined): 'ltr' | 'rtl' {
  if (!el) return 'ltr'
  const withDir = el.closest('[dir]')
  const attr = withDir?.getAttribute('dir')
  if (attr === 'rtl' || attr === 'ltr') return attr
  if (typeof getComputedStyle === 'function') {
    return getComputedStyle(el).direction === 'rtl' ? 'rtl' : 'ltr'
  }
  return 'ltr'
}
