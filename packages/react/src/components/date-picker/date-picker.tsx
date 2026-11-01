'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar, type CalendarProps, type DateRange, type Matcher } from '../calendar/calendar'
import { DateField } from '../date-field/date-field'
import { TimeField } from '../time-field/time-field'
import { Input, inputVariants } from '../input'
import { Popover, PopoverContent, PopoverTrigger, type PopoverContentProps } from '../popover/popover'
import { buttonVariants } from '../button/button-variants'
import { useFieldRootContext } from '@base-ui/react/internals/field-root-context'
import { useLabelableContext } from '@base-ui/react/internals/labelable-provider'
import { cn } from '../../internal/utils'

type DatePickerSize = 'sm' | 'md' | 'lg'
type DatePickerVariant = 'outline' | 'soft'
type DatePickerMode = 'single' | 'range' | 'multiple'

type DistributiveOmit<T, K extends keyof never> = T extends unknown ? Omit<T, K> : never

type CalendarPassthrough = DistributiveOmit<
  CalendarProps,
  | 'mode'
  | 'selected'
  | 'onSelect'
  | 'month'
  | 'onMonthChange'
  | 'size'
  | 'classNames'
  | 'components'
  | 'className'
  | 'disabled'
>

type DatePickerBase = CalendarPassthrough & {
  /**
   * Height, padding, and calendar cell scale.
   * @default 'md'
   */
  size?: DatePickerSize
  /**
   * Field appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: DatePickerVariant
  /**
   * date-fns format for the date field(s).
   * @default 'MM/dd/yyyy'
   */
  dateFormat?: string
  /**
   * date-fns format for the time field(s).
   * @default 'HH:mm:ss'
   */
  timeFormat?: string
  /**
   * Show a clear button (multiple mode).
   * @default false
   */
  clearable?: boolean
  /** Content pinned to the start edge. */
  startSlot?: React.ReactNode
  /** Content pinned to the end edge. */
  endSlot?: React.ReactNode
  /**
   * Disable the whole control.
   * @default false
   */
  disabled?: boolean
  /** Dates that can't be selected in the calendar. */
  disabledDates?: Matcher | Matcher[]
  /**
   * Make the typeable fields read-only.
   * @default false
   */
  readOnly?: boolean
  /**
   * Mark the form field as required.
   * @default false
   */
  required?: boolean
  /**
   * Hidden input name for form submission. `range` mode emits `name[from]` / `name[to]`; with `showTime` the value is a
   * full datetime.
   */
  name?: string
  /** Flag the field invalid - sets `data-invalid` for styling + conveys it to assistive tech. */
  'aria-invalid'?: boolean
  /** Classes on the root wrapper - use for footprint/layout (e.g. `max-w-60`). Merged via `tailwind-merge`. */
  className?: string
  /**
   * Classes on the inner field box - use to override field styling (border, radius, background). Merged via
   * `tailwind-merge`.
   */
  inputClassName?: string
  /**
   * Separator between the range's two fields.
   * @default '–'
   */
  rangeSeparator?: React.ReactNode
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean
  /**
   * Uncontrolled initial open state.
   * @default false
   */
  defaultOpen?: boolean
  /** Fires when the popover opens or closes. */
  onOpenChange?: (open: boolean) => void
  /**
   * Preferred popover side.
   * @default 'bottom'
   */
  side?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * Popover alignment.
   * @default 'end'
   */
  align?: 'start' | 'center' | 'end'
  /**
   * Gap between the field and the popover.
   * @default 6
   */
  sideOffset?: number
  /** Escape hatch forwarded to the inner `PopoverContent` (collision props, `className`, …). */
  popoverProps?: Partial<PopoverContentProps>
  /**
   * Override auto-close. By default only single mode closes on pick; range and multiple stay open (dismiss on
   * outside-click/Escape).
   * @default auto
   */
  closeOnSelect?: boolean
  /**
   * Add a `TimeField` (single/range modes).
   * @default false
   */
  showTime?: boolean
  /**
   * Icon for the popover trigger button.
   * @default calendar icon
   */
  triggerIcon?: React.ReactNode
  /**
   * Accessible label for the trigger button.
   * @default 'Open calendar'
   */
  triggerAriaLabel?: string
  /**
   * Accessible label for the start of a range (its date field, plus its time field with `showTime`).
   * @default 'Start date'
   */
  startAriaLabel?: string
  /**
   * Accessible label for the end of a range (its date field, plus its time field with `showTime`).
   * @default 'End date'
   */
  endAriaLabel?: string
}

type DatePickerProps =
  | (DatePickerBase & {
      mode?: 'single'
      value?: Date | undefined
      defaultValue?: Date | undefined
      onValueChange?: (v: Date | undefined) => void
    })
  | (DatePickerBase & {
      mode: 'range'
      value?: DateRange | undefined
      defaultValue?: DateRange | undefined
      onValueChange?: (v: DateRange | undefined) => void
    })
  | (DatePickerBase & {
      /**
       * Selection behavior; determines the `value` shape.
       * @default 'single'
       */
      mode: 'multiple'
      /** Controlled value; shape matches `mode`. Pair with `onValueChange`. */
      value?: Date[] | undefined
      /** Uncontrolled initial value. */
      defaultValue?: Date[] | undefined
      /** Fires when the selection changes; the argument shape matches `mode`. */
      onValueChange?: (v: Date[] | undefined) => void
      /** Placeholder for the multiple-mode summary field. */
      placeholder?: string
      /** Customize the multiple-mode summary text. */
      formatValue?: (value: Date[] | undefined) => string
    })

const DEFAULT_TRIGGER_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
    <path d="M14.425 8.825H3.575v5.425c0 .245.097.481.27.654s.409.271.654.271h9c.245 0 .481-.097.654-.271s.271-.409.271-.654V8.825zm-9.163 3.35c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.25 0c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.253 0c.318 0 .575.258.575.575s-.258.575-.575.575h-.003c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.003zM5.26 9.925c.318 0 .575.258.575.575s-.258.575-.575.575h-.01c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.01zm2.252 0c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.25 0c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.253 0c.318 0 .575.258.575.575s-.258.575-.575.575h-.003c-.317 0-.575-.258-.575-.575s.258-.575.575-.575h.003zm-.59-4.675v-.925h-4.85v.925c0 .318-.258.575-.575.575s-.575-.258-.575-.575v-.925H4.5c-.245 0-.481.097-.654.271s-.27.409-.27.654v2.425h10.85V5.25c0-.245-.097-.481-.271-.654s-.409-.271-.654-.271h-.925v.925c0 .318-.258.575-.575.575s-.575-.258-.575-.575zm4.15 9c0 .55-.219 1.078-.608 1.467s-.916.608-1.467.608h-9c-.55 0-1.078-.219-1.467-.608s-.608-.916-.608-1.467v-9c0-.55.219-1.078.608-1.467s.916-.608 1.467-.608h.925V2.25c0-.318.258-.575.575-.575s.575.258.575.575v.925h4.85V2.25c0-.318.258-.575.575-.575s.575.258.575.575v.925h.925c.55 0 1.078.219 1.467.608s.608.916.608 1.467v9z" />
  </svg>
)

const TRIGGER_BUTTON_OVERRIDES: Record<DatePickerSize, string> = {
  sm: 'size-6 rounded-xs -me-1.25',
  md: 'size-8 rounded-sm -me-1.75',
  lg: 'size-10 rounded-md -me-2.25',
}

const TRIGGER_BUTTON_SIZES: Record<DatePickerSize, 'icon-sm' | 'icon-md' | 'icon-lg'> = {
  sm: 'icon-sm',
  md: 'icon-md',
  lg: 'icon-lg',
}

function DatePicker(props: DatePickerProps) {
  const {
    size = 'md',
    mode = 'single',
    variant = 'outline',
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    showTime = false,
    dateFormat = 'MM/dd/yyyy',
    timeFormat = 'HH:mm:ss',
    placeholder,
    clearable,
    startSlot,
    endSlot,
    disabled: disabledProp,
    disabledDates,
    readOnly,
    required,
    name: nameProp,
    side = 'bottom',
    align = 'end',
    sideOffset = 6,
    popoverProps,
    closeOnSelect,
    rangeSeparator = '–',
    triggerIcon = DEFAULT_TRIGGER_ICON,
    triggerAriaLabel = 'Open calendar',
    startAriaLabel = 'Start date',
    endAriaLabel = 'End date',
    formatValue,
    'aria-invalid': _ariaInvalid,
    className,
    inputClassName,
    ...calendarProps
  } = props as DatePickerBase & {
    mode?: DatePickerMode
    value?: Date | Date[] | DateRange
    defaultValue?: Date | Date[] | DateRange
    onValueChange?: (v: unknown) => void
    placeholder?: string
    formatValue?: (value: Date[] | undefined) => string
  }

  const field = useFieldRootContext(true)
  const { labelId } = useLabelableContext()
  const disabled = disabledProp || field.disabled
  const name = nameProp ?? field.name
  const invalid = props['aria-invalid'] === true || field.invalid === true

  const wasControlledRef = React.useRef(value !== undefined)
  if (value !== undefined) wasControlledRef.current = true
  const isValueControlled = wasControlledRef.current
  const [internalValue, setInternalValue] = React.useState<Date | Date[] | DateRange | undefined>(defaultValue)
  const currentValue = isValueControlled ? value : internalValue

  const isOpenControlled = open !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const currentOpen = isOpenControlled ? open : internalOpen

  const [calendarMonth, setCalendarMonth] = React.useState<Date | undefined>(() => {
    const fromValue = deriveCalendarMonth(mode, defaultValue ?? value)
    if (fromValue) return fromValue
    return (calendarProps as { defaultMonth?: Date }).defaultMonth
  })

  const derivedMonth = deriveCalendarMonth(mode, currentValue)
  const lastDerivedKeyRef = React.useRef<string>(monthKey(derivedMonth))
  React.useEffect(() => {
    const key = monthKey(derivedMonth)
    if (key !== lastDerivedKeyRef.current) {
      lastDerivedKeyRef.current = key
      if (derivedMonth) setCalendarMonth(derivedMonth)
    }
  }, [derivedMonth])

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isOpenControlled, onOpenChange],
  )

  const setValue = React.useCallback(
    (next: Date | Date[] | DateRange | undefined) => {
      if (!isValueControlled) setInternalValue(next)
      onValueChange?.(next)
      if (shouldAutoClose(mode, next, closeOnSelect)) setOpen(false)
    },
    [isValueControlled, mode, closeOnSelect, onValueChange, setOpen],
  )

  const handleDateFieldChange = (nextDate: Date | null) => {
    if (mode !== 'single') return
    if (!nextDate) {
      setValue(undefined)
      return
    }
    setValue(mergeDateAndTime(nextDate, currentValue as Date | undefined))
  }

  const handleTimeFieldChange = (nextTime: string | null) => {
    if (mode !== 'single' || !showTime) return
    const cur = currentValue as Date | undefined
    if (!cur) return
    setValue(applyTimeString(cur, nextTime))
  }

  const handleRangeFromDateChange = (nextDate: Date | null) => {
    if (mode !== 'range') return
    const cur = currentValue as DateRange | undefined
    const merged = nextDate ? mergeDateAndTime(nextDate, cur?.from) : undefined
    setValue({ from: merged, to: cur?.to })
  }

  const handleRangeToDateChange = (nextDate: Date | null) => {
    if (mode !== 'range') return
    const cur = currentValue as DateRange | undefined
    const merged = nextDate ? mergeDateAndTime(nextDate, cur?.to) : undefined
    setValue({ from: cur?.from, to: merged })
  }

  const handleRangeFromTimeChange = (nextTime: string | null) => {
    if (mode !== 'range' || !showTime) return
    const cur = currentValue as DateRange | undefined
    if (!cur?.from) return
    setValue({ from: applyTimeString(cur.from, nextTime), to: cur.to })
  }

  const handleRangeToTimeChange = (nextTime: string | null) => {
    if (mode !== 'range' || !showTime) return
    const cur = currentValue as DateRange | undefined
    if (!cur?.to) return
    setValue({ from: cur.from, to: applyTimeString(cur.to, nextTime) })
  }

  const handleCalendarSelect = (nextRaw: Date | Date[] | DateRange | undefined) => {
    if (mode === 'single' && nextRaw instanceof Date) {
      setValue(mergeDateAndTime(nextRaw, currentValue as Date | undefined))
    } else if (mode === 'range' && nextRaw && !(nextRaw instanceof Date) && !Array.isArray(nextRaw)) {
      const cur = currentValue as DateRange | undefined
      const r = nextRaw as DateRange
      setValue({
        from: r.from ? mergeDateAndTime(r.from, cur?.from) : undefined,
        to: r.to ? mergeDateAndTime(r.to, cur?.to) : undefined,
      })
    } else {
      setValue(nextRaw)
    }
  }

  const clearAll = React.useCallback(() => setValue(undefined), [setValue])

  const anchorRef = React.useRef<HTMLDivElement>(null)

  const triggerButton = (
    <PopoverTrigger
      disabled={disabled}
      render={(triggerProps) => (
        <button
          {...(triggerProps as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          type="button"
          aria-label={triggerAriaLabel}
          className={cn(
            buttonVariants({ variant: 'ghost', size: TRIGGER_BUTTON_SIZES[size] }),
            TRIGGER_BUTTON_OVERRIDES[size],
            'text-foreground',
          )}
        >
          {triggerIcon}
        </button>
      )}
    />
  )

  const sharedFieldProps = {
    variant,
    size,
    disabled,
    readOnly,
    required,
    'aria-invalid': invalid || undefined,
  } as const

  let fields: React.ReactNode

  if (mode === 'single') {
    const date = currentValue as Date | undefined
    if (showTime) {
      fields = (
        <UnifiedWrapper
          variant={variant}
          size={size}
          disabled={disabled}
          ariaInvalid={invalid || undefined}
          className={inputClassName}
          startSlot={startSlot}
          endSlot={endSlot}
          trigger={triggerButton}
        >
          <DateField
            unstyled
            value={date ?? null}
            onValueChange={handleDateFieldChange}
            format={dateFormat}
            {...sharedFieldProps}
          />
          <TimeField
            unstyled
            value={date ? format(date, 'HH:mm:ss') : null}
            onValueChange={handleTimeFieldChange}
            format={timeFormat}
            {...sharedFieldProps}
          />
        </UnifiedWrapper>
      )
    } else {
      fields = (
        <DateField
          value={date ?? null}
          onValueChange={handleDateFieldChange}
          format={dateFormat}
          startSlot={startSlot}
          endSlot={
            <>
              {endSlot}
              {triggerButton}
            </>
          }
          className={inputClassName}
          {...sharedFieldProps}
        />
      )
    }
  } else if (mode === 'range') {
    const range = currentValue as DateRange | undefined
    fields = (
      <UnifiedWrapper
        variant={variant}
        size={size}
        disabled={disabled}
        ariaInvalid={invalid || undefined}
        className={inputClassName}
        startSlot={startSlot}
        endSlot={endSlot}
        trigger={triggerButton}
        role="group"
        ariaLabelledBy={labelId}
      >
        <DateField
          unstyled
          value={range?.from ?? null}
          onValueChange={handleRangeFromDateChange}
          format={dateFormat}
          aria-label={startAriaLabel}
          {...sharedFieldProps}
        />
        {showTime && (
          <TimeField
            unstyled
            value={range?.from ? format(range.from, 'HH:mm:ss') : null}
            onValueChange={handleRangeFromTimeChange}
            format={timeFormat}
            aria-label={startAriaLabel}
            {...sharedFieldProps}
          />
        )}
        <span className="text-foreground-muted shrink-0" aria-hidden="true">
          {rangeSeparator}
        </span>
        <DateField
          unstyled
          value={range?.to ?? null}
          onValueChange={handleRangeToDateChange}
          format={dateFormat}
          aria-label={endAriaLabel}
          {...sharedFieldProps}
        />
        {showTime && (
          <TimeField
            unstyled
            value={range?.to ? format(range.to, 'HH:mm:ss') : null}
            onValueChange={handleRangeToTimeChange}
            format={timeFormat}
            aria-label={endAriaLabel}
            {...sharedFieldProps}
          />
        )}
      </UnifiedWrapper>
    )
  } else {
    const days = currentValue as Date[] | undefined
    const display = formatValue ? formatValue(days) : defaultMultipleFormat(days, dateFormat)
    fields = (
      <Input
        inputSize={size}
        variant={variant}
        value={display}
        readOnly
        placeholder={placeholder}
        clearable={clearable && (days?.length ?? 0) > 0}
        onClear={clearAll}
        startSlot={startSlot}
        endSlot={
          <>
            {endSlot}
            {triggerButton}
          </>
        }
        disabled={disabled}
        required={required}
        name={name}
        aria-invalid={invalid || undefined}
        className={inputClassName}
      />
    )
  }

  let hiddenInputs: React.ReactNode = null
  if (name && mode === 'single') {
    hiddenInputs = <input type="hidden" name={name} value={toFormValue(currentValue as Date | undefined, showTime)} />
  } else if (name && mode === 'range') {
    const r = currentValue as DateRange | undefined
    hiddenInputs = (
      <>
        <input type="hidden" name={`${name}[from]`} value={toFormValue(r?.from ?? undefined, showTime)} />
        <input type="hidden" name={`${name}[to]`} value={toFormValue(r?.to ?? undefined, showTime)} />
      </>
    )
  }

  return (
    <Popover open={currentOpen} onOpenChange={setOpen}>
      <div ref={anchorRef} data-slot="date-picker-anchor" className={cn('flex w-full', className)}>
        {fields}
        {hiddenInputs}
      </div>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        arrow={false}
        {...popoverProps}
        anchor={anchorRef}
        className={cn('w-fit max-w-none min-w-0 p-3', popoverProps?.className)}
      >
        <Calendar
          size={size}
          mode={mode as never}
          selected={currentValue as never}
          onSelect={handleCalendarSelect as never}
          {...(calendarProps as Record<string, unknown>)}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          disabled={disabledDates}
        />
      </PopoverContent>
    </Popover>
  )
}

interface UnifiedWrapperProps {
  variant: DatePickerVariant
  size: DatePickerSize
  disabled?: boolean
  ariaInvalid?: boolean
  className?: string
  startSlot?: React.ReactNode
  endSlot?: React.ReactNode
  trigger: React.ReactNode
  role?: 'group'
  ariaLabelledBy?: string
  children: React.ReactNode
}

function UnifiedWrapper({
  variant,
  size,
  disabled,
  ariaInvalid,
  className,
  startSlot,
  endSlot,
  trigger,
  role,
  ariaLabelledBy,
  children,
}: UnifiedWrapperProps) {
  return (
    <div
      data-slot="date-picker"
      data-disabled={disabled || undefined}
      data-invalid={ariaInvalid || undefined}
      role={role}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        inputVariants({ variant, size, state: 'within' }),
        'flex w-full',
        'data-disabled:border-border-strong! data-disabled:bg-background-subtle! data-disabled:opacity-disabled data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:border-dashed',
        className,
      )}
    >
      {startSlot ? (
        <div data-slot="date-picker-start" className="-ms-1 shrink-0">
          {startSlot}
        </div>
      ) : null}
      {children}
      {endSlot ? (
        <div data-slot="date-picker-end" className="shrink-0">
          {endSlot}
        </div>
      ) : null}
      <div data-slot="date-picker-trigger" className="ms-auto -me-1 shrink-0">
        {trigger}
      </div>
    </div>
  )
}

function shouldAutoClose(
  mode: DatePickerMode,
  next: Date | Date[] | DateRange | undefined,
  override?: boolean,
): boolean {
  if (override !== undefined) return override
  if (mode === 'single') return next instanceof Date
  return false
}

function mergeDateAndTime(nextDate: Date, withTime: Date | undefined): Date {
  if (!withTime) return nextDate
  const out = new Date(nextDate)
  out.setHours(withTime.getHours(), withTime.getMinutes(), withTime.getSeconds(), withTime.getMilliseconds())
  return out
}

function toFormValue(date: Date | undefined, showTime: boolean): string {
  if (!date) return ''
  return format(date, showTime ? "yyyy-MM-dd'T'HH:mm:ss" : 'yyyy-MM-dd')
}

function applyTimeString(base: Date, timeStr: string | null): Date {
  const out = new Date(base)
  if (!timeStr) {
    out.setHours(0, 0, 0, 0)
    return out
  }
  const [h, m, s] = timeStr.split(':').map((n) => Number(n) || 0)
  out.setHours(h ?? 0, m ?? 0, s ?? 0, 0)
  return out
}

function deriveCalendarMonth(mode: DatePickerMode, value: Date | Date[] | DateRange | undefined): Date | undefined {
  if (!value) return undefined
  if (mode === 'single') return value instanceof Date ? value : undefined
  if (mode === 'range') {
    const r = value as DateRange
    return r.from ?? r.to ?? undefined
  }
  if (mode === 'multiple') {
    const days = value as Date[]
    return days[days.length - 1]
  }
  return undefined
}

function monthKey(d: Date | undefined): string {
  if (!d) return ''
  return `${d.getFullYear()}-${d.getMonth()}`
}

function defaultMultipleFormat(days: Date[] | undefined, dateFormat: string): string {
  if (!days || days.length === 0) return ''
  const first = format(days[0]!, dateFormat)
  return days.length === 1 ? first : `${first} (+${days.length - 1} more)`
}

export { DatePicker }
export type { DatePickerProps, DateRange }
