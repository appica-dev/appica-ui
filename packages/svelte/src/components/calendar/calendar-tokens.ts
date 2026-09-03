import type { DateValue } from '@internationalized/date'
import { buttonVariants } from '../button/button-variants'
import { cn } from '../../internal/utils'

export type CalendarSize = 'sm' | 'md' | 'lg'
export type CalendarMode = 'single' | 'multiple' | 'range'
/** @deprecated Use `CalendarMode`. */
export type CalendarType = CalendarMode
export type CalendarCaptionLayout = 'dropdown' | 'dropdown-months' | 'dropdown-years' | 'label'

export type DateRange = {
  from?: DateValue
  to?: DateValue
}

export type DateAfter = { after: DateValue }
export type DateBefore = { before: DateValue }
export type DateInterval = { before: DateValue; after: DateValue }
export type DayOfWeek = { dayOfWeek: number[] }

/** Dates that can't be selected. Mirrors react-day-picker's Matcher, with `DateValue` instead of `Date`. */
export type Matcher =
  | boolean
  | DateValue
  | Date
  | DateValue[]
  | Date[]
  | DateRange
  | DateBefore
  | DateAfter
  | DateInterval
  | DayOfWeek
  | ((date: DateValue) => boolean)
  | Matcher[]

export type CalendarMonth = {
  value: DateValue
  weeks: DateValue[][]
}

export const ROOT_CONFIG: Record<CalendarSize, { text: string; cellVar: string; cellOuter: string }> = {
  sm: { text: 'text-xs', cellVar: '[--cell-size:--spacing(6)]', cellOuter: 'min-w-6.5' },
  md: { text: 'text-sm', cellVar: '[--cell-size:--spacing(8)]', cellOuter: 'min-w-8.5' },
  lg: { text: 'text-base', cellVar: '[--cell-size:--spacing(10)]', cellOuter: 'min-w-10.5' },
}

export const MONTH_GAP: Record<CalendarSize, string> = {
  sm: 'gap-4',
  md: 'gap-4.5',
  lg: 'gap-4.5',
}

export const HEADER_GAP: Record<CalendarSize, string> = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-2.5',
}

export const WEEKDAY_PADDING: Record<CalendarSize, string> = {
  sm: 'pb-1.5',
  md: 'pb-2',
  lg: 'pb-2',
}

export const ROW_GAP: Record<CalendarSize, string> = {
  sm: 'mt-1',
  md: 'mt-1',
  lg: 'mt-1',
}

export const ROUNDED: Record<CalendarSize, { full: string; start: string; end: string }> = {
  sm: { full: 'rounded-xs', start: 'rounded-s-xs', end: 'rounded-e-xs' },
  md: { full: 'rounded-sm', start: 'rounded-s-sm', end: 'rounded-e-sm' },
  lg: { full: 'rounded-md', start: 'rounded-s-md', end: 'rounded-e-md' },
}

export const NAV_BUTTON_CLASS: Record<CalendarSize, string> = {
  sm: cn(
    buttonVariants({ variant: 'outline', size: 'icon-sm' }),
    "size-(--cell-size) rounded-xs [&_svg:not([class*='size-'])]:size-3.5",
  ),
  md: cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'size-(--cell-size)'),
  lg: cn(buttonVariants({ variant: 'outline', size: 'icon-md' }), 'size-(--cell-size)'),
}

export const PREV_CHEVRON_FLIP = '[&_svg]:rtl:rotate-180'
export const NEXT_CHEVRON_FLIP = '[&_svg]:rotate-180 [&_svg]:rtl:rotate-0'

export const SELECT_CONFIG: Record<CalendarSize, { size: 'sm' | 'md'; extra: string }> = {
  sm: { size: 'sm', extra: 'w-auto h-6 px-2 rounded-xs gap-1 [&>svg]:size-3.5' },
  md: { size: 'md', extra: 'w-auto h-8 px-2.5 rounded-sm text-sm [&>svg]:size-4' },
  lg: { size: 'md', extra: 'w-auto text-base' },
}

export const RANGE_CELL: Record<CalendarSize, string> = {
  sm: cn(
    'data-range-start:bg-background-muted data-range-start:rounded-s-xs',
    'data-range-end:bg-background-muted data-range-end:rounded-e-xs',
    'data-range-middle:bg-background-muted data-highlighted:bg-background-muted',
  ),
  md: cn(
    'data-range-start:bg-background-muted data-range-start:rounded-s-sm',
    'data-range-end:bg-background-muted data-range-end:rounded-e-sm',
    'data-range-middle:bg-background-muted data-highlighted:bg-background-muted',
  ),
  lg: cn(
    'data-range-start:bg-background-muted data-range-start:rounded-s-md',
    'data-range-end:bg-background-muted data-range-end:rounded-e-md',
    'data-range-middle:bg-background-muted data-highlighted:bg-background-muted',
  ),
}

export const DAY_BUTTON_BASE = cn(
  'relative isolate flex size-(--cell-size) cursor-pointer items-center justify-center',
  'font-normal whitespace-nowrap outline-offset-1 outline-ring',
  'transform-gpu transition duration-250 ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
  'active:scale-[0.97] active:translate-y-px active:duration-100 active:ease-in-out',
  'motion-reduce:transition-none',
  'before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit]',
  'before:bg-background-muted before:opacity-0',
  'before:transition-all before:duration-300 motion-reduce:before:transition-none',
  'text-foreground-strong',
  'data-outside-month:text-foreground-muted',
  'hover:text-foreground-intense hover:font-medium hover:before:opacity-100',
  'data-today:not-data-selected:text-foreground-intense data-today:not-data-selected:font-medium data-today:not-data-selected:before:opacity-100',
  'data-selected:not-data-range-middle:before:bg-primary data-selected:not-data-range-middle:text-primary-foreground data-selected:not-data-range-middle:outline-ring-primary data-selected:not-data-range-middle:hover:before:bg-primary data-selected:not-data-range-middle:before:opacity-100',
  'data-range-middle:text-foreground-intense data-range-middle:rounded-none data-range-middle:font-medium data-range-middle:before:opacity-100',
  'data-highlighted:not-data-selected:before:opacity-100',
  'data-disabled:text-foreground-subtle data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:line-through data-disabled:before:opacity-0!',
  'data-unavailable:line-through',
)

export function formatCalendarMonth(
  date: DateValue,
  locale?: string,
  month: Intl.DateTimeFormatOptions['month'] = 'short',
) {
  return new Date(date.year, date.month - 1, 1).toLocaleString(locale ?? 'default', { month })
}

export function yearsInRange(minValue: DateValue, maxValue: DateValue) {
  const years: number[] = []
  for (let year = minValue.year; year <= maxValue.year; year++) {
    years.push(year)
  }
  return years
}

export function fireNativeSelectChange(onchange: unknown, value: string) {
  if (typeof onchange !== 'function') return
  onchange({ target: { value }, currentTarget: { value } })
}
