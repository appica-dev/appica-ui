import { getContext, setContext } from 'svelte'

export type ProgressVariant = 'bar' | 'circular'

export interface ProgressContextValue {
  value: () => number | null
  min: () => number
  max: () => number
  format: () => Intl.NumberFormatOptions | undefined
  locale: () => Intl.LocalesArgument | undefined
  labelId: () => string | undefined
  setLabelId: (id: string | undefined) => void
}

const KEY = Symbol('appica-progress')

const DEFAULT_FORMAT: Intl.NumberFormatOptions = { style: 'percent', maximumFractionDigits: 0 }

const numberFormatCache = new Map<string, Intl.NumberFormat>()

export function setProgressContext(value: ProgressContextValue) {
  setContext(KEY, value)
}

export function getProgressContext(): ProgressContextValue {
  const ctx = getContext<ProgressContextValue>(KEY)
  if (!ctx) {
    throw new Error('Progress sub-components must be rendered inside <Progress>')
  }
  return ctx
}

export function percentOf(value: number | null, min: number, max: number): number {
  if (value == null) return 0
  const span = max - min
  if (span === 0) return 0
  return Math.max(0, Math.min(100, ((value - min) / span) * 100))
}

function getNumberFormat(format?: Intl.NumberFormatOptions, locale?: Intl.LocalesArgument): Intl.NumberFormat {
  const options = { ...DEFAULT_FORMAT, ...format }
  const cacheKey = JSON.stringify([locale ?? '', options])
  let formatter = numberFormatCache.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options)
    numberFormatCache.set(cacheKey, formatter)
  }
  return formatter
}

export function formatPercent(
  value: number | null,
  min: number,
  max: number,
  format?: Intl.NumberFormatOptions,
  locale?: Intl.LocalesArgument,
): string {
  if (value == null) return ''
  return getNumberFormat(format, locale).format(percentOf(value, min, max) / 100)
}
