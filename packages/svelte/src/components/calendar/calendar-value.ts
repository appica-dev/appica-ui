import { CalendarDate, type DateValue } from '@internationalized/date'
import type { CalendarMode, DateRange } from './calendar-tokens'

export type CalendarSelection = DateValue | DateValue[] | DateRange
export type CalendarDateInput = Date | DateValue
export type CalendarRangeInput = { from?: CalendarDateInput; to?: CalendarDateInput }
export type CalendarSelectedInput = CalendarDateInput | CalendarDateInput[] | CalendarRangeInput

export function isDateValue(value: unknown): value is DateValue {
  return typeof value === 'object' && value !== null && 'calendar' in value && 'year' in value && 'month' in value
}

export function toDateValue(input: CalendarDateInput): DateValue {
  if (input instanceof Date) {
    return new CalendarDate(input.getFullYear(), input.getMonth() + 1, input.getDate())
  }
  return input
}

export function isCalendarRange(next: unknown): next is CalendarRangeInput {
  return typeof next === 'object' && next !== null && !Array.isArray(next) && !(next instanceof Date) && 'from' in next
}

export function toAppicaRange(next: CalendarRangeInput): DateRange {
  return {
    from: next.from ? toDateValue(next.from) : undefined,
    to: next.to ? toDateValue(next.to) : undefined,
  }
}

export function normalizeSelected(
  next: CalendarSelectedInput | undefined,
  mode: CalendarMode,
): CalendarSelection | undefined {
  if (next == null) return undefined
  if (mode === 'multiple') {
    if (!Array.isArray(next)) return []
    return next.map(toDateValue)
  }
  if (mode === 'range') {
    if (!isCalendarRange(next)) return { from: undefined, to: undefined }
    return toAppicaRange(next)
  }
  if (Array.isArray(next) || isCalendarRange(next)) return undefined
  return toDateValue(next)
}
