<script lang="ts" module>
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import type { DateValue } from '@internationalized/date'
  import type { TimeValue } from 'bits-ui'
  import type { CalendarSize, CalendarMode, DateRange } from '../calendar/calendar-tokens'
  import type { DateFieldVariant } from '../date-field/date-field.svelte'

  export type DatePickerSize = CalendarSize
  export type DatePickerVariant = DateFieldVariant
  export type DatePickerType = CalendarMode
  export type { DateRange }

  type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6
  type Side = 'top' | 'bottom' | 'left' | 'right'
  type Align = 'start' | 'center' | 'end'

  export type DatePickerProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    /**
     * Height, padding, and calendar cell scale.
     * @default 'md'
     */
    size?: DatePickerSize
    /**
     * Selection behavior. `range` uses a start/end pair.
     * @default 'single'
     */
    type?: DatePickerType
    /**
     * Field appearance - bordered or filled.
     * @default 'outline'
     */
    variant?: DatePickerVariant
    /** Controlled value. Shape matches `type`. Pair with `onValueChange` or `bind:value`. */
    value?: DateValue | DateValue[] | DateRange
    /** Uncontrolled initial value. */
    defaultValue?: DateValue | DateValue[] | DateRange
    /** Fires when the selection changes. The argument shape matches `type`. */
    onValueChange?: (value: DateValue | DateValue[] | DateRange | undefined) => void
    /** Controlled open state. Pair with `onOpenChange` or `bind:open`. */
    open?: boolean
    /**
     * Uncontrolled initial open state.
     * @default false
     */
    defaultOpen?: boolean
    /** Fires when the popover opens or closes. */
    onOpenChange?: (open: boolean) => void
    /**
     * Add a `TimeField` (single and range types).
     * @default false
     */
    showTime?: boolean
    /**
     * Show a clear button (multiple type).
     * @default false
     */
    clearable?: boolean
    /** Adornment rendered before the field(s), inside the frame. */
    start?: Snippet
    /** Adornment rendered after the field(s), inside the frame. */
    end?: Snippet
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    name?: string
    /**
     * Separator between the range's two fields.
     * @default '-'
     */
    rangeSeparator?: string
    /**
     * Preferred popover side.
     * @default 'bottom'
     */
    side?: Side
    /**
     * Popover alignment.
     * @default 'end'
     */
    align?: Align
    /**
     * Gap between the field and the popover.
     * @default 6
     */
    sideOffset?: number
    /** Extra props forwarded to `PopoverContent` (`class`, `keepMounted`, …). */
    popoverProps?: { class?: string; keepMounted?: boolean; [key: string]: unknown }
    /**
     * Override auto-close. By default only single type closes on pick; range and multiple stay open.
     */
    closeOnSelect?: boolean
    /** Icon rendered inside the calendar trigger button. */
    triggerIcon?: Snippet
    /**
     * Accessible label for the trigger button.
     * @default 'Open calendar'
     */
    triggerAriaLabel?: string
    /** Placeholder for the multiple-type summary field. */
    placeholder?: string
    /** Customize the multiple-type summary text. */
    formatValue?: (value: DateValue[] | undefined) => string
    /** Visible month when the calendar opens, if no value is selected. */
    defaultPlaceholder?: DateValue
    /** Locale used to format field segments and the calendar. */
    locale?: string
    /**
     * First day of the week. `0` is Sunday, `1` is Monday.
     * @default 1
     */
    weekStartsOn?: WeekStartsOn
    minValue?: DateValue
    maxValue?: DateValue
    fixedWeeks?: boolean
    isDateDisabled?: (date: DateValue) => boolean
    isDateUnavailable?: (date: DateValue) => boolean
    /**
     * 12-hour or 24-hour clock when `showTime` is set.
     */
    hourCycle?: 12 | 24
    /** Classes on the inner field box. */
    inputClassName?: string
  }
</script>

<script lang="ts">
  import { Time, toCalendarDate, toCalendarDateTime } from '@internationalized/date'
  import { untrack } from 'svelte'
  import { cn, commitBindableChange } from '../../internal/utils'
  import { buttonVariants } from '../button/button-variants'
  import Calendar from '../calendar/calendar.svelte'
  import DateField from '../date-field/date-field.svelte'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import Input from '../input/input.svelte'
  import { inputVariants } from '../input/input-variants'
  import { Popover, PopoverContent, PopoverTrigger } from '../popover'
  import TimeField from '../time-field/time-field.svelte'

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

  function isRange(value: unknown): value is DateRange {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && 'from' in value
  }

  function isDateValue(value: unknown): value is DateValue {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && 'year' in value && 'month' in value
  }

  function toTimeValue(value: DateValue | undefined): Time | undefined {
    if (!value) return undefined
    if ('hour' in value) {
      return new Time(value.hour, value.minute, value.second, value.millisecond)
    }
    return new Time(0, 0)
  }

  function mergeDateAndTime(nextDate: DateValue, withTime: DateValue | TimeValue | undefined, withClock: boolean): DateValue {
    if (!withClock) return toCalendarDate(nextDate)
    const time =
      withTime && 'hour' in withTime
        ? new Time(withTime.hour, withTime.minute, withTime.second, withTime.millisecond)
        : new Time(0, 0)
    return toCalendarDateTime(toCalendarDate(nextDate), time)
  }

  function applyTime(base: DateValue | undefined, time: TimeValue | undefined): DateValue | undefined {
    if (!base) return undefined
    if (!time) return toCalendarDate(base)
    return toCalendarDateTime(toCalendarDate(base), new Time(time.hour, time.minute, time.second, time.millisecond))
  }

  function toFormValue(date: DateValue | undefined, withClock: boolean): string {
    if (!date) return ''
    if (!withClock) return toCalendarDate(date).toString()
    const time = toTimeValue(date) ?? new Time(0, 0)
    const hour = String(time.hour).padStart(2, '0')
    const minute = String(time.minute).padStart(2, '0')
    const second = String(time.second).padStart(2, '0')
    return `${toCalendarDate(date).toString()}T${hour}:${minute}:${second}`
  }

  function derivePlaceholder(
    selection: DatePickerType,
    next: DateValue | DateValue[] | DateRange | undefined,
    fallback?: DateValue,
  ): DateValue | undefined {
    if (selection === 'single' && isDateValue(next)) return toCalendarDate(next)
    if (selection === 'range' && isRange(next)) {
      const date = next.from ?? next.to
      if (date) return toCalendarDate(date)
    }
    if (selection === 'multiple' && Array.isArray(next) && next.length > 0) {
      return toCalendarDate(next[next.length - 1]!)
    }
    return fallback
  }

  function monthKey(date: DateValue | undefined): string {
    if (!date) return ''
    return `${date.year}-${date.month}`
  }

  function defaultMultipleFormat(days: DateValue[] | undefined): string {
    if (!days?.length) return ''
    const first = toCalendarDate(days[0]!).toString()
    if (days.length === 1) return first
    return `${first} (+${days.length - 1} more)`
  }

  function shouldAutoClose(
    selection: DatePickerType,
    next: DateValue | DateValue[] | DateRange | undefined,
    override?: boolean,
  ): boolean {
    if (override !== undefined) return override
    if (selection === 'single') return isDateValue(next)
    return false
  }

  let {
    class: className,
    size = 'md',
    type = 'single',
    variant = 'outline',
    value = $bindable(),
    defaultValue,
    onValueChange,
    open = $bindable(),
    defaultOpen = false,
    onOpenChange,
    showTime = false,
    clearable = false,
    start,
    end,
    disabled,
    readonly,
    required,
    name,
    rangeSeparator = '-',
    side = 'bottom',
    align = 'end',
    sideOffset = 6,
    popoverProps,
    closeOnSelect,
    triggerIcon,
    triggerAriaLabel = 'Open calendar',
    placeholder,
    formatValue,
    defaultPlaceholder,
    locale,
    weekStartsOn = 1,
    minValue,
    maxValue,
    fixedWeeks = false,
    isDateDisabled,
    isDateUnavailable,
    hourCycle,
    inputClassName,
    id,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedby,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...rest
  }: DatePickerProps = $props()

  const field = getFieldContext()
  const control = $derived(
    mergeFieldControl({
      field,
      id,
      name,
      disabled,
      ariaInvalid,
      ariaDescribedby,
      omitId: true,
    }),
  )

  const labelledBy = $derived([ariaLabelledby, field?.labelId].filter(Boolean).join(' ') || undefined)

  let inner = $state<DateValue | DateValue[] | DateRange | undefined>(undefined)
  inner = untrack(() => value ?? defaultValue)

  let innerOpen = $state(false)
  innerOpen = untrack(() => open ?? defaultOpen)

  let calendarPlaceholder = $state<DateValue | undefined>(undefined)
  calendarPlaceholder = untrack(() => derivePlaceholder(type, value ?? defaultValue, defaultPlaceholder))
  let lastDerivedKey = untrack(() => monthKey(calendarPlaceholder))

  $effect(() => {
    if (value !== undefined) inner = value
  })

  $effect(() => {
    if (open !== undefined) innerOpen = open
  })

  const current = $derived(value !== undefined ? value : inner)

  $effect(() => {
    const derived = derivePlaceholder(type, current)
    const key = monthKey(derived)
    if (key && key !== lastDerivedKey) {
      lastDerivedKey = key
      calendarPlaceholder = derived
    }
  })

  function setOpen(next: boolean) {
    commitBindableChange({
      next,
      bound: open,
      setBound: (bound) => {
        open = bound
      },
      setInner: (bound) => {
        innerOpen = bound
      },
      onChange: onOpenChange,
    })
  }

  function setValue(next: DateValue | DateValue[] | DateRange | undefined) {
    commitBindableChange({
      next,
      bound: value,
      setBound: (bound) => {
        value = bound
      },
      setInner: (bound) => {
        inner = bound
      },
      onChange: onValueChange,
    })
    if (shouldAutoClose(type, next, closeOnSelect)) setOpen(false)
  }

  function handleDateFieldChange(nextDate: DateValue | undefined) {
    if (type !== 'single') return
    if (!nextDate) {
      setValue(undefined)
      return
    }
    const cur = isDateValue(current) ? current : undefined
    setValue(mergeDateAndTime(nextDate, cur, showTime))
  }

  function handleTimeFieldChange(nextTime: TimeValue | undefined) {
    if (type !== 'single' || !showTime) return
    const cur = isDateValue(current) ? current : undefined
    if (!cur) return
    setValue(applyTime(cur, nextTime))
  }

  function handleRangeFromDateChange(nextDate: DateValue | undefined) {
    if (type !== 'range') return
    const cur = isRange(current) ? current : undefined
    setValue({
      from: nextDate ? mergeDateAndTime(nextDate, cur?.from, showTime) : undefined,
      to: cur?.to,
    })
  }

  function handleRangeToDateChange(nextDate: DateValue | undefined) {
    if (type !== 'range') return
    const cur = isRange(current) ? current : undefined
    setValue({
      from: cur?.from,
      to: nextDate ? mergeDateAndTime(nextDate, cur?.to, showTime) : undefined,
    })
  }

  function handleRangeFromTimeChange(nextTime: TimeValue | undefined) {
    if (type !== 'range' || !showTime) return
    const cur = isRange(current) ? current : undefined
    if (!cur?.from) return
    setValue({ from: applyTime(cur.from, nextTime), to: cur.to })
  }

  function handleRangeToTimeChange(nextTime: TimeValue | undefined) {
    if (type !== 'range' || !showTime) return
    const cur = isRange(current) ? current : undefined
    if (!cur?.to) return
    setValue({ from: cur.from, to: applyTime(cur.to, nextTime) })
  }

  function handleCalendarSelect(next: DateValue | DateValue[] | DateRange | undefined) {
    if (type === 'single') {
      if (!isDateValue(next)) {
        setValue(undefined)
        return
      }
      const cur = isDateValue(current) ? current : undefined
      setValue(mergeDateAndTime(next, cur, showTime))
      return
    }
    if (type === 'range') {
      if (next !== undefined && !isRange(next)) return
      const cur = isRange(current) ? current : undefined
      setValue({
        from: next?.from ? mergeDateAndTime(next.from, cur?.from, showTime) : undefined,
        to: next?.to ? mergeDateAndTime(next.to, cur?.to, showTime) : undefined,
      })
      return
    }
    setValue(Array.isArray(next) ? next : undefined)
  }

  function handlePlaceholderChange(next: DateValue) {
    lastDerivedKey = monthKey(next)
    calendarPlaceholder = next
  }

  const singleDate = $derived(type === 'single' && isDateValue(current) ? current : undefined)
  const rangeValue = $derived(type === 'range' && isRange(current) ? current : undefined)
  const multipleDays = $derived(type === 'multiple' && Array.isArray(current) ? current : undefined)
  const multipleDisplay = $derived(
    type === 'multiple' ? (formatValue ? formatValue(multipleDays) : defaultMultipleFormat(multipleDays)) : '',
  )

  const wrapperClass = $derived(
    cn(
      inputVariants({ variant, size, state: 'within' }),
      'flex w-full',
      'data-disabled:border-border-strong! data-disabled:bg-background-subtle! data-disabled:opacity-disabled data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:border-dashed',
      inputClassName,
    ),
  )

  const emitHidden = $derived(Boolean(control.name) && (type === 'range' || (type === 'single' && showTime)))
  const popoverClassName = $derived(typeof popoverProps?.class === 'string' ? popoverProps.class : undefined)
  const popoverKeepMounted = $derived(popoverProps?.keepMounted === true)
  const popoverRest = $derived.by(() => {
    if (!popoverProps) return {}
    const { class: _className, keepMounted: _keepMounted, ...restProps } = popoverProps
    return restProps
  })
</script>

{#snippet defaultTriggerIcon()}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
    <path
      d="M14.425 8.825H3.575v5.425c0 .245.097.481.27.654s.409.271.654.271h9c.245 0 .481-.097.654-.271s.271-.409.271-.654V8.825zm-9.163 3.35c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.25 0c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.253 0c.318 0 .575.258.575.575s-.258.575-.575.575h-.003c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.003zM5.26 9.925c.318 0 .575.258.575.575s-.258.575-.575.575h-.01c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.01zm2.252 0c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.25 0c.317 0 .574.258.574.575s-.257.575-.574.575h-.004c-.318 0-.575-.258-.575-.575s.258-.575.575-.575h.004zm2.253 0c.318 0 .575.258.575.575s-.258.575-.575.575h-.003c-.317 0-.575-.258-.575-.575s.258-.575.575-.575h.003zm-.59-4.675v-.925h-4.85v.925c0 .318-.258.575-.575.575s-.575-.258-.575-.575v-.925H4.5c-.245 0-.481.097-.654.271s-.27.409-.27.654v2.425h10.85V5.25c0-.245-.097-.481-.271-.654s-.409-.271-.654-.271h-.925v.925c0 .318-.258.575-.575.575s-.575-.258-.575-.575zm4.15 9c0 .55-.219 1.078-.608 1.467s-.916.608-1.467.608h-9c-.55 0-1.078-.219-1.467-.608s-.608-.916-.608-1.467v-9c0-.55.219-1.078.608-1.467s.916-.608 1.467-.608h.925V2.25c0-.318.258-.575.575-.575s.575.258.575.575v.925h4.85V2.25c0-.318.258-.575.575-.575s.575.258.575.575v.925h.925c.55 0 1.078.219 1.467.608s.608.916.608 1.467v9z"
    />
  </svg>
{/snippet}

{#snippet calendarTrigger()}
  <PopoverTrigger
    type="button"
    disabled={control.disabled}
    aria-label={triggerAriaLabel}
    class={cn(
      buttonVariants({ variant: 'ghost', size: TRIGGER_BUTTON_SIZES[size] }),
      TRIGGER_BUTTON_OVERRIDES[size],
      'text-foreground',
    )}
  >
    {#if triggerIcon}
      {@render triggerIcon()}
    {:else}
      {@render defaultTriggerIcon()}
    {/if}
  </PopoverTrigger>
{/snippet}

{#snippet composedEnd()}
  {@render end?.()}
  {@render calendarTrigger()}
{/snippet}

{#snippet calendarPanel()}
  <Calendar
    {size}
    mode={type}
    selected={current}
    onSelect={handleCalendarSelect}
    month={calendarPlaceholder}
    onMonthChange={handlePlaceholderChange}
    {locale}
    {weekStartsOn}
    startMonth={minValue}
    endMonth={maxValue}
    {fixedWeeks}
    disabled={isDateDisabled}
    {isDateUnavailable}
    {required}
  />
{/snippet}

<Popover open={innerOpen} onOpenChange={setOpen}>
  <div
    data-slot="date-picker"
    data-disabled={control.disabled ? '' : undefined}
    data-invalid={control.invalid ? '' : undefined}
    aria-invalid={control.ariaInvalid}
    aria-disabled={control.disabled || undefined}
    aria-label={ariaLabel}
    aria-labelledby={labelledBy}
    class={cn('flex w-full', className)}
    {...rest}
  >
    {#if type === 'single' && !showTime}
      <DateField
        value={singleDate}
        onValueChange={handleDateFieldChange}
        {variant}
        {size}
        {start}
        end={composedEnd}
        disabled={control.disabled}
        {readonly}
        {required}
        name={control.name}
        granularity="day"
        {locale}
        {minValue}
        {maxValue}
        class={inputClassName}
      />
    {:else if type === 'single' && showTime}
      <div
        data-slot="date-picker-field"
        data-disabled={control.disabled ? '' : undefined}
        data-invalid={control.invalid ? '' : undefined}
        class={wrapperClass}
      >
        {#if start}
          <div data-slot="date-picker-start" class="-ms-1 shrink-0">
            {@render start()}
          </div>
        {/if}
        <DateField unstyled value={singleDate} onValueChange={handleDateFieldChange} {variant} {size} disabled={control.disabled} {readonly} {required} granularity="day" {locale} {minValue} {maxValue} />
        <TimeField
          unstyled
          value={singleDate ? toTimeValue(singleDate) : undefined}
          onValueChange={handleTimeFieldChange}
          {variant}
          {size}
          disabled={control.disabled}
          {readonly}
          {required}
          {locale}
          {hourCycle}
        />
        {#if end}
          <div data-slot="date-picker-end" class="shrink-0">
            {@render end()}
          </div>
        {/if}
        <div data-slot="date-picker-trigger" class="ms-auto -me-1 shrink-0">
          {@render calendarTrigger()}
        </div>
      </div>
    {:else if type === 'range'}
      <div
        data-slot="date-picker-field"
        data-disabled={control.disabled ? '' : undefined}
        data-invalid={control.invalid ? '' : undefined}
        class={wrapperClass}
      >
        {#if start}
          <div data-slot="date-picker-start" class="-ms-1 shrink-0">
            {@render start()}
          </div>
        {/if}
        <DateField
          unstyled
          value={rangeValue?.from}
          onValueChange={handleRangeFromDateChange}
          {variant}
          {size}
          disabled={control.disabled}
          {readonly}
          {required}
          granularity="day"
          {locale}
          {minValue}
          {maxValue}
        />
        {#if showTime}
          <TimeField
            unstyled
            value={rangeValue?.from ? toTimeValue(rangeValue.from) : undefined}
            onValueChange={handleRangeFromTimeChange}
            {variant}
            {size}
            disabled={control.disabled}
            {readonly}
            {required}
            {locale}
            {hourCycle}
          />
        {/if}
        <span class="text-foreground-muted shrink-0" aria-hidden="true">{rangeSeparator}</span>
        <DateField
          unstyled
          value={rangeValue?.to}
          onValueChange={handleRangeToDateChange}
          {variant}
          {size}
          disabled={control.disabled}
          {readonly}
          {required}
          granularity="day"
          {locale}
          {minValue}
          {maxValue}
        />
        {#if showTime}
          <TimeField
            unstyled
            value={rangeValue?.to ? toTimeValue(rangeValue.to) : undefined}
            onValueChange={handleRangeToTimeChange}
            {variant}
            {size}
            disabled={control.disabled}
            {readonly}
            {required}
            {locale}
            {hourCycle}
          />
        {/if}
        {#if end}
          <div data-slot="date-picker-end" class="shrink-0">
            {@render end()}
          </div>
        {/if}
        <div data-slot="date-picker-trigger" class="ms-auto -me-1 shrink-0">
          {@render calendarTrigger()}
        </div>
      </div>
    {:else}
      <Input
        inputSize={size}
        {variant}
        value={multipleDisplay}
        readonly
        {placeholder}
        clearable={clearable && (multipleDays?.length ?? 0) > 0}
        onClear={() => setValue(undefined)}
        {start}
        end={composedEnd}
        disabled={control.disabled}
        {required}
        name={control.name}
        aria-invalid={control.ariaInvalid}
        class={inputClassName}
      />
    {/if}
    {#if emitHidden && type === 'single'}
      <input type="hidden" name={control.name} value={toFormValue(singleDate, showTime)} />
    {:else if emitHidden && type === 'range'}
      <input type="hidden" name={`${control.name}[from]`} value={toFormValue(rangeValue?.from, showTime)} />
      <input type="hidden" name={`${control.name}[to]`} value={toFormValue(rangeValue?.to, showTime)} />
    {/if}
  </div>
  <PopoverContent
    {side}
    {align}
    {sideOffset}
    arrow={false}
    keepMounted={popoverKeepMounted}
    class={cn('w-fit max-w-none min-w-0 p-3', popoverClassName)}
    {...popoverRest}
  >
    {@render calendarPanel()}
  </PopoverContent>
</Popover>
