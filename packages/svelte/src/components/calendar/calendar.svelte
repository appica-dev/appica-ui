<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { DateValue } from '@internationalized/date'
  import type { CalendarCaptionLayout, CalendarMode, CalendarSize, Matcher } from './calendar-tokens'
  import type { CalendarDateInput, CalendarSelectedInput, CalendarSelection } from './calendar-value'

  type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6

  export type CalendarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    /**
     * Cell size and text scale (Appica extension).
     * @default 'md'
     */
    size?: CalendarSize
    /**
     * Selection behavior. `range` uses a start/end pair.
     * @default 'single'
     */
    mode?: CalendarMode
    /** Controlled selection. Shape matches `mode`. Pair with `onSelect` or `bind:selected`. */
    selected?: CalendarSelectedInput
    /** Uncontrolled initial selection. */
    defaultSelected?: CalendarSelectedInput
    /** Fires when the selection changes. The argument shape matches `mode`. */
    onSelect?: (value: CalendarSelection | undefined) => void
    /** Controlled displayed month. Pair with `onMonthChange` or `bind:month`. */
    month?: CalendarDateInput
    /** Uncontrolled initial month to display. */
    defaultMonth?: CalendarDateInput
    /** Fires when the user navigates to another month. */
    onMonthChange?: (month: DateValue) => void
    /**
     * Month/year header: select dropdowns, or a static label with arrows.
     * @default 'dropdown'
     */
    captionLayout?: CalendarCaptionLayout
    /**
     * Render days from the adjacent months.
     * @default true
     */
    showOutsideDays?: boolean
    /**
     * How many months to display.
     * @default 1
     */
    numberOfMonths?: number
    /**
     * When several months are visible, jump by that count instead of one month.
     * @default false
     */
    pagedNavigation?: boolean
    /**
     * First day of the week. `0` is Sunday, `1` is Monday.
     * @default 1
     */
    weekStartsOn?: WeekStartsOn
    /** Locale used to format weekdays, months, and years. */
    locale?: string
    readonly?: boolean
    /**
     * Prevent clearing the selection by re-clicking the selected day.
     * @default false
     */
    required?: boolean
    /**
     * Earliest navigable month.
     * @default 1925-01-01
     */
    startMonth?: CalendarDateInput
    /**
     * Latest navigable month.
     * @default 2050-12-31
     */
    endMonth?: CalendarDateInput
    /**
     * Always render six week rows.
     * @default false
     */
    fixedWeeks?: boolean
    /** Dates that can't be selected (a date, range, weekday set, or predicate). */
    disabled?: Matcher
    /** Return true to mark a date unavailable. */
    isDateUnavailable?: (date: DateValue) => boolean
  }
</script>

<script lang="ts">
  import { CalendarDate } from '@internationalized/date'
  import { untrack } from 'svelte'
  import { Calendar as BitsCalendar, RangeCalendar as BitsRangeCalendar } from 'bits-ui'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'
  import CalendarView from './calendar-view.svelte'
  import { isDateMatching } from './calendar-matcher'
  import { ROOT_CONFIG, yearsInRange, type DateRange } from './calendar-tokens'
  import { isCalendarRange, normalizeSelected, toDateValue } from './calendar-value'

  type BitsDateRange = { start: DateValue | undefined; end: DateValue | undefined }

  const DEFAULT_START = new CalendarDate(1925, 1, 1)
  const DEFAULT_END = new CalendarDate(2050, 12, 31)

  let {
    class: className,
    size = 'md',
    mode = 'single',
    selected = $bindable(),
    defaultSelected,
    onSelect,
    month = $bindable(),
    defaultMonth,
    onMonthChange,
    captionLayout = 'dropdown',
    showOutsideDays = true,
    numberOfMonths = 1,
    pagedNavigation = false,
    weekStartsOn = 1,
    locale,
    readonly,
    required = false,
    startMonth,
    endMonth,
    fixedWeeks = false,
    disabled,
    isDateUnavailable,
    ...rest
  }: CalendarProps = $props()

  const selectionMode = $derived(mode)

  function toSingle(next: CalendarSelection | CalendarDateInput | undefined): DateValue | undefined {
    if (next == null || Array.isArray(next)) return undefined
    if (isCalendarRange(next)) return next.from ? toDateValue(next.from) : undefined
    return toDateValue(next)
  }

  function toMultiple(next: CalendarSelection | undefined): DateValue[] {
    if (Array.isArray(next)) return next.map(toDateValue)
    return []
  }

  function toBitsRange(next: CalendarSelection | undefined): BitsDateRange {
    if (isCalendarRange(next)) {
      return {
        start: next.from ? toDateValue(next.from) : undefined,
        end: next.to ? toDateValue(next.to) : undefined,
      }
    }
    return { start: undefined, end: undefined }
  }

  function fromBitsRange(next: BitsDateRange | undefined): DateRange {
    return { from: next?.start, to: next?.end }
  }

  let innerSingle = $state<DateValue | undefined>(undefined)
  let innerMultiple = $state<DateValue[]>([])
  let innerRange = $state<BitsDateRange>({ start: undefined, end: undefined })
  let innerPlaceholder = $state<DateValue | undefined>(undefined)

  innerSingle = untrack(() => toSingle(normalizeSelected(selected ?? defaultSelected, 'single')))
  innerMultiple = untrack(() => toMultiple(normalizeSelected(selected ?? defaultSelected, 'multiple')))
  innerRange = untrack(() => toBitsRange(normalizeSelected(selected ?? defaultSelected, 'range')))
  innerPlaceholder = untrack(() => (month !== undefined ? toDateValue(month) : defaultMonth ? toDateValue(defaultMonth) : undefined))

  $effect(() => {
    if (selected === undefined) return
    const next = normalizeSelected(selected, selectionMode)
    if (selectionMode === 'multiple') innerMultiple = toMultiple(next)
    else if (selectionMode === 'range') innerRange = toBitsRange(next)
    else innerSingle = toSingle(next)
  })

  $effect(() => {
    if (month !== undefined) innerPlaceholder = toDateValue(month)
  })

  function handleMonthChange(next: DateValue) {
    commitBindableChange({
      next,
      bound: month === undefined ? undefined : toDateValue(month),
      setBound: (nextValue) => {
        month = nextValue
      },
      onChange: onMonthChange,
      setInner: (nextValue) => {
        innerPlaceholder = nextValue
      },
    })
  }

  function handleSingleChange(next: DateValue | undefined) {
    commitBindableChange({
      next,
      bound: selected === undefined ? undefined : toSingle(normalizeSelected(selected, 'single')),
      setBound: (nextValue) => {
        selected = nextValue
      },
      onChange: onSelect,
      setInner: (nextValue) => {
        innerSingle = toSingle(nextValue)
      },
    })
  }

  function handleMultipleChange(next: DateValue[]) {
    commitBindableChange({
      next,
      bound: selected === undefined ? undefined : toMultiple(normalizeSelected(selected, 'multiple')),
      setBound: (nextValue) => {
        selected = nextValue
      },
      onChange: onSelect,
      setInner: (nextValue) => {
        innerMultiple = toMultiple(nextValue)
      },
    })
  }

  function handleRangeChange(next: BitsDateRange) {
    const mapped = fromBitsRange(next)
    commitBindableChange({
      next: mapped,
      bound: selected === undefined ? undefined : fromBitsRange(toBitsRange(normalizeSelected(selected, 'range'))),
      setBound: (nextValue) => {
        selected = nextValue
      },
      onChange: onSelect,
      setInner: (nextValue) => {
        innerRange = toBitsRange(nextValue)
      },
    })
  }

  const cfg = $derived(ROOT_CONFIG[size])
  const rootClasses = $derived(cn('inline-flex w-fit flex-col', cfg.text, cfg.cellVar, className))
  const minValue = $derived(startMonth ? toDateValue(startMonth) : DEFAULT_START)
  const maxValue = $derived(endMonth ? toDateValue(endMonth) : DEFAULT_END)
  const years = $derived(yearsInRange(minValue, maxValue))
  const dateDisabled = $derived(disabled === true)
  const isDateDisabled = $derived.by(() => {
    if (disabled == null || disabled === false) return undefined
    return (date: DateValue) => isDateMatching(date, disabled)
  })

  const shared = $derived({
    weekStartsOn,
    locale,
    disabled: dateDisabled,
    readonly,
    minValue,
    maxValue,
    fixedWeeks,
    isDateDisabled,
    isDateUnavailable,
    numberOfMonths,
    pagedNavigation,
    preventDeselect: required,
    weekdayFormat: 'short' as const,
    disableDaysOutsideMonth: !showOutsideDays,
  })

  const viewProps = $derived({
    size,
    captionLayout,
    showOutsideDays,
    locale,
    years,
  })
</script>

{#if mode === 'range'}
  <BitsRangeCalendar.Root
    data-slot="calendar"
    class={rootClasses}
    bind:value={innerRange}
    bind:placeholder={innerPlaceholder}
    onValueChange={handleRangeChange}
    onPlaceholderChange={handleMonthChange}
    {...shared}
    {...asBitsAttrs(rest)}
  >
    {#snippet children({ months, weekdays })}
      <CalendarView range {...viewProps} {months} {weekdays} />
    {/snippet}
  </BitsRangeCalendar.Root>
{:else if mode === 'multiple'}
  <BitsCalendar.Root
    data-slot="calendar"
    class={rootClasses}
    type="multiple"
    bind:value={innerMultiple}
    bind:placeholder={innerPlaceholder}
    onValueChange={handleMultipleChange}
    onPlaceholderChange={handleMonthChange}
    {...shared}
    {...asBitsAttrs(rest)}
  >
    {#snippet children({ months, weekdays })}
      <CalendarView {...viewProps} {months} {weekdays} />
    {/snippet}
  </BitsCalendar.Root>
{:else}
  <BitsCalendar.Root
    data-slot="calendar"
    class={rootClasses}
    type="single"
    bind:value={innerSingle}
    bind:placeholder={innerPlaceholder}
    onValueChange={handleSingleChange}
    onPlaceholderChange={handleMonthChange}
    {...shared}
    {...asBitsAttrs(rest)}
  >
    {#snippet children({ months, weekdays })}
      <CalendarView {...viewProps} {months} {weekdays} />
    {/snippet}
  </BitsCalendar.Root>
{/if}
