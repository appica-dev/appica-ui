'use client'

import * as React from 'react'
import {
  DayPicker,
  type ChevronProps,
  type DateRange,
  type DayButtonProps,
  type DropdownProps,
  type Matcher,
} from 'react-day-picker'
import { buttonVariants } from '../button/button-variants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select/select'
import { cn } from '../../internal/utils'

type CalendarSize = 'sm' | 'md' | 'lg'

type DayPickerProps = React.ComponentProps<typeof DayPicker>

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never

interface CalendarExtensions {
  /**
   * Cell size and text scale (Appica extension).
   * @default 'md'
   */
  size?: CalendarSize
  /** Extra classes on the root, merged via `tailwind-merge`. */
  className?: string
}

type CalendarProps = DistributiveOmit<DayPickerProps, 'classNames' | 'components'> & CalendarExtensions

const ROOT_CONFIG: Record<CalendarSize, { text: string; cellVar: string; cellOuter: string }> = {
  sm: { text: 'text-xs', cellVar: '[--cell-size:--spacing(6)]', cellOuter: 'min-w-6.5' },
  md: { text: 'text-sm', cellVar: '[--cell-size:--spacing(8)]', cellOuter: 'min-w-8.5' },
  lg: { text: 'text-base', cellVar: '[--cell-size:--spacing(10)]', cellOuter: 'min-w-10.5' },
}

const MONTH_GAP: Record<CalendarSize, string> = {
  sm: 'gap-4',
  md: 'gap-4.5',
  lg: 'gap-4.5',
}

const HEADER_GAP: Record<CalendarSize, string> = {
  sm: 'gap-1',
  md: 'gap-2',
  lg: 'gap-2.5',
}

const WEEKDAY_PADDING: Record<CalendarSize, string> = {
  sm: 'pb-1.5',
  md: 'pb-2',
  lg: 'pb-2',
}

const ROW_GAP: Record<CalendarSize, string> = {
  sm: 'mt-1',
  md: 'mt-1',
  lg: 'mt-1',
}

const ROUNDED: Record<CalendarSize, { full: string; start: string; end: string }> = {
  sm: { full: 'rounded-xs', start: 'rounded-s-xs', end: 'rounded-e-xs' },
  md: { full: 'rounded-sm', start: 'rounded-s-sm', end: 'rounded-e-sm' },
  lg: { full: 'rounded-md', start: 'rounded-s-md', end: 'rounded-e-md' },
}

const NAV_BUTTON_CLASS: Record<CalendarSize, string> = {
  sm: cn(
    buttonVariants({ variant: 'outline', size: 'icon-sm' }),
    "size-(--cell-size) rounded-xs [&_svg:not([class*='size-'])]:size-3.5",
  ),
  md: cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'size-(--cell-size)'),
  lg: cn(buttonVariants({ variant: 'outline', size: 'icon-md' }), 'size-(--cell-size)'),
}

const PREV_CHEVRON_FLIP = '[&_svg]:rtl:rotate-180'
const NEXT_CHEVRON_FLIP = '[&_svg]:rotate-180 [&_svg]:rtl:rotate-0'

const SELECT_CONFIG: Record<CalendarSize, { size: 'sm' | 'md'; extra: string }> = {
  sm: { size: 'sm', extra: 'w-auto h-6 px-2 rounded-xs gap-1 [&>svg]:size-3.5' },
  md: { size: 'md', extra: 'w-auto h-8 px-2.5 rounded-sm text-sm [&>svg]:size-4' },
  lg: { size: 'md', extra: 'w-auto text-base' },
}

const DEFAULT_START_MONTH = new Date(1925, 0)
const DEFAULT_END_MONTH = new Date(2050, 11)

interface CalendarContextValue {
  size: CalendarSize
  rounded: string
}

const CalendarContext = React.createContext<CalendarContextValue>({ size: 'md', rounded: ROUNDED.md.full })

function CalendarDropdownSlot(props: DropdownProps) {
  const { size } = React.useContext(CalendarContext)
  return <CalendarDropdown {...props} calendarSize={size} />
}

function CalendarDayButtonSlot(props: DayButtonProps) {
  const { size, rounded } = React.useContext(CalendarContext)
  return <CalendarDayButton {...props} calendarSize={size} rounded={rounded} />
}

const CALENDAR_COMPONENTS = {
  Chevron: CalendarChevron,
  Dropdown: CalendarDropdownSlot,
  DayButton: CalendarDayButtonSlot,
}

function Calendar({
  size = 'md',
  showOutsideDays = true,
  captionLayout = 'dropdown',
  startMonth = DEFAULT_START_MONTH,
  endMonth = DEFAULT_END_MONTH,
  weekStartsOn = 1,
  formatters,
  className,
  ...props
}: CalendarProps) {
  const cfg = ROOT_CONFIG[size]
  const r = ROUNDED[size]
  const isLabel = captionLayout === 'label'

  const calendarContext = React.useMemo<CalendarContextValue>(() => ({ size, rounded: r.full }), [size, r.full])

  return (
    <CalendarContext.Provider value={calendarContext}>
      <div data-slot="calendar" className={cn('inline-flex w-fit flex-col', cfg.text, cfg.cellVar, className)}>
        <DayPicker
          showOutsideDays={showOutsideDays}
          captionLayout={captionLayout}
          startMonth={startMonth}
          endMonth={endMonth}
          weekStartsOn={weekStartsOn}
          formatters={{
            formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'short' }),
            ...formatters,
          }}
          classNames={{
            months: cn('relative flex flex-col', MONTH_GAP[size]),
            month: cn('flex w-full flex-col', MONTH_GAP[size]),
            month_caption: 'flex h-(--cell-size) items-center justify-center px-[calc(var(--cell-size)+0.5rem)]',
            caption_label: isLabel ? 'text-foreground-intense font-medium' : 'sr-only',
            nav: 'pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between',
            button_previous: cn(NAV_BUTTON_CLASS[size], 'pointer-events-auto', PREV_CHEVRON_FLIP),
            button_next: cn(NAV_BUTTON_CLASS[size], 'pointer-events-auto', NEXT_CHEVRON_FLIP),
            dropdowns: cn('flex items-center', HEADER_GAP[size]),
            dropdown_root: 'relative',
            dropdown: 'sr-only',
            month_grid: 'border-collapse',
            weekdays: 'flex',
            weekday: cn(
              'text-foreground-muted flex flex-1 items-end justify-center font-normal',
              cfg.cellOuter,
              WEEKDAY_PADDING[size],
            ),
            weeks: '',
            week: cn('flex w-full', ROW_GAP[size]),
            day: cn('relative flex aspect-square flex-1 items-center justify-center', cfg.cellOuter),
            range_start: cn('bg-background-muted', r.start),
            range_middle: 'bg-background-muted',
            range_end: cn('bg-background-muted', r.end),
          }}
          components={CALENDAR_COMPONENTS}
          {...(props as DayPickerProps)}
        />
      </div>
    </CalendarContext.Provider>
  )
}

interface CalendarDayButtonProps extends DayButtonProps {
  calendarSize: CalendarSize
  rounded: string
}

const DAY_BUTTON_BASE = cn(
  'relative isolate flex size-(--cell-size) cursor-pointer items-center justify-center',
  'font-normal whitespace-nowrap outline-offset-1 outline-ring',
  'transform-gpu transition duration-250 ease-spring',
  'active:scale-[0.97] active:translate-y-px active:duration-100 active:ease-in-out',
  'motion-reduce:transition-none',
  'before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit]',
  'before:bg-background-muted before:opacity-0',
  'before:transition-all before:duration-300 motion-reduce:before:transition-none',
)

function CalendarDayButton({
  calendarSize: _calendarSize,
  rounded,
  modifiers,
  day: _day,
  className,
  ...props
}: CalendarDayButtonProps) {
  const isSelected = Boolean(modifiers.selected)
  const isToday = Boolean(modifiers.today)
  const isOutside = Boolean(modifiers.outside)
  const isDisabled = Boolean(modifiers.disabled)
  const isRangeStart = Boolean(modifiers.range_start)
  const isRangeMiddle = Boolean(modifiers.range_middle)
  const isRangeEnd = Boolean(modifiers.range_end)
  const isRangeEndpoint = isRangeStart || isRangeEnd
  const isFilled = (isSelected && !isRangeMiddle) || isRangeEndpoint

  return (
    <button
      type="button"
      data-slot="calendar-day"
      {...props}
      className={cn(
        DAY_BUTTON_BASE,
        rounded,
        !isFilled && !isRangeMiddle && (isOutside ? 'text-foreground-muted' : 'text-foreground-strong'),
        !isFilled &&
          !isRangeMiddle &&
          !isDisabled &&
          'hover:text-foreground-intense hover:font-medium hover:before:opacity-100',
        isToday && !isFilled && !isRangeMiddle && 'text-foreground-intense font-medium before:opacity-100',
        isRangeMiddle && 'text-foreground-intense rounded-none font-medium before:opacity-100',
        isFilled &&
          'before:bg-primary text-primary-foreground outline-ring-primary hover:before:bg-primary before:opacity-100',
        isDisabled && 'text-foreground-subtle pointer-events-none cursor-not-allowed line-through before:opacity-0!',
        className,
      )}
    />
  )
}

function CalendarChevron({ orientation, className, ...props }: ChevronProps) {
  const rotate = orientation === 'up' ? 'rotate-90' : orientation === 'down' ? '-rotate-90' : ''
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={cn(rotate, className)}
      {...props}
    >
      <path d="M9.594 3.594c.225-.225.588-.225.812 0s.225.588 0 .812L6.812 8l3.594 3.594c.225.225.225.588 0 .813s-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812l4-4z" />
    </svg>
  )
}

interface CalendarDropdownProps extends DropdownProps {
  calendarSize: CalendarSize
}

function CalendarDropdown({
  calendarSize,
  options,
  value,
  onChange,
  className,
  disabled,
  'aria-label': ariaLabel,
}: CalendarDropdownProps) {
  const cfg = SELECT_CONFIG[calendarSize]
  const items = React.useMemo(
    () => options?.map((opt) => ({ value: String(opt.value), label: opt.label })) ?? [],
    [options],
  )
  return (
    <Select
      size={cfg.size}
      variant="soft"
      items={items}
      value={String(value ?? '')}
      onValueChange={(next) => {
        if (!onChange) return
        const fakeEvent = {
          target: { value: String(next) },
          currentTarget: { value: String(next) },
        } as unknown as React.ChangeEvent<HTMLSelectElement>
        onChange(fakeEvent)
      }}
      disabled={disabled}
    >
      <SelectTrigger aria-label={ariaLabel} className={cn(cfg.extra, className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options?.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)} disabled={opt.disabled}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { Calendar }
export type { CalendarProps, DateRange, Matcher }
