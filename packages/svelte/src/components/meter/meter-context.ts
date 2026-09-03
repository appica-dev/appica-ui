import { getContext, setContext } from 'svelte'

export type MeterStatus = 'optimum' | 'suboptimum' | 'invalid'

export interface MeterStatusClassNames {
  optimum?: string
  suboptimum?: string
  invalid?: string
  default?: string
}

export interface MeterContextValue {
  value: () => number
  min: () => number
  max: () => number
  formatted: () => string
  indicatorBg: () => string
  percent: () => number
  labelId: () => string | undefined
  setLabelId: (id: string | undefined) => void
}

const KEY = Symbol('appica-meter')

export function setMeterContext(value: MeterContextValue) {
  setContext(KEY, value)
}

export function getMeterContext(): MeterContextValue {
  const ctx = getContext<MeterContextValue>(KEY)
  if (!ctx) {
    throw new Error('Meter sub-components must be rendered inside <Meter>')
  }
  return ctx
}

export const DEFAULT_STATUS_CLASSES: Required<MeterStatusClassNames> = {
  optimum: 'bg-success-emphasis',
  suboptimum: 'bg-warning-emphasis',
  invalid: 'bg-error-emphasis',
  default: 'bg-primary',
}

export function percentOf(value: number, min: number, max: number): number {
  const span = max - min
  if (span === 0) return 0
  return Math.max(0, Math.min(100, ((value - min) / span) * 100))
}

export function clampMeterValue(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function formatMeterValue(
  value: number,
  min: number,
  max: number,
  format?: Intl.NumberFormatOptions,
  locale?: Intl.LocalesArgument,
): string {
  const pct = percentOf(value, min, max) / 100
  const clamped = clampMeterValue(value, min, max)
  try {
    return format
      ? new Intl.NumberFormat(locale, format).format(clamped)
      : new Intl.NumberFormat(locale, { style: 'percent' }).format(pct)
  } catch {
    return new Intl.NumberFormat(undefined, { style: 'percent' }).format(pct)
  }
}

export function computeStatus(
  value: number,
  min: number,
  max: number,
  low: number | undefined,
  high: number | undefined,
  optimum: number | undefined,
): MeterStatus {
  const resolvedLow = low ?? min
  const resolvedHigh = high ?? max
  const resolvedOpt = optimum ?? (min + max) / 2

  const zone = (v: number): 0 | 1 | 2 => (v < resolvedLow ? 0 : v > resolvedHigh ? 2 : 1)

  const optZone = zone(resolvedOpt)
  const valZone = zone(value)

  if (valZone === optZone) return 'optimum'
  if (Math.abs(valZone - optZone) === 1) return 'suboptimum'
  return 'invalid'
}
