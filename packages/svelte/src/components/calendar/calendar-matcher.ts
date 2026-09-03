import { getLocalTimeZone, type DateValue } from '@internationalized/date'
import type { DateAfter, DateBefore, DateInterval, DateRange, DayOfWeek, Matcher } from './calendar-tokens'
import { isCalendarRange, isDateValue, toDateValue } from './calendar-value'

function isSameDay(left: DateValue, right: DateValue) {
  return left.compare(right) === 0
}

function isDayOfWeek(value: object): value is DayOfWeek {
  return 'dayOfWeek' in value && Array.isArray((value as DayOfWeek).dayOfWeek)
}

function isDateInterval(value: object): value is DateInterval {
  return 'before' in value && 'after' in value
}

function isDateBefore(value: object): value is DateBefore {
  return 'before' in value && !('after' in value)
}

function isDateAfter(value: object): value is DateAfter {
  return 'after' in value && !('before' in value)
}

function weekday(date: DateValue) {
  return date.toDate(getLocalTimeZone()).getDay()
}

function matchOne(date: DateValue, matcher: Matcher): boolean {
  if (matcher === true) return true
  if (matcher === false) return false
  if (typeof matcher === 'function') return matcher(date)
  if (matcher instanceof Date || isDateValue(matcher)) {
    return isSameDay(date, toDateValue(matcher))
  }
  if (Array.isArray(matcher)) {
    return matcher.some((item) => matchOne(date, item))
  }
  if (isDayOfWeek(matcher)) {
    return matcher.dayOfWeek.includes(weekday(date))
  }
  if (isDateInterval(matcher)) {
    return date.compare(toDateValue(matcher.after)) > 0 && date.compare(toDateValue(matcher.before)) < 0
  }
  if (isDateBefore(matcher)) {
    return date.compare(toDateValue(matcher.before)) < 0
  }
  if (isDateAfter(matcher)) {
    return date.compare(toDateValue(matcher.after)) > 0
  }
  if (isCalendarRange(matcher)) {
    const range = matcher as DateRange
    if (range.from && date.compare(toDateValue(range.from)) < 0) return false
    if (range.to && date.compare(toDateValue(range.to)) > 0) return false
    return Boolean(range.from || range.to)
  }
  return false
}

export function isDateMatching(date: DateValue, matcher: Matcher | undefined) {
  if (matcher == null) return false
  return matchOne(date, matcher)
}
