<script lang="ts">
  import { CalendarDate } from '@internationalized/date'
  import Calendar from './calendar.svelte'
  import type { CalendarCaptionLayout, CalendarMode, CalendarSize, Matcher } from './calendar-tokens'
  import type { CalendarSelectedInput, CalendarSelection } from './calendar-value'

  let {
    mode = 'single',
    size,
    selected,
    defaultSelected,
    month = new CalendarDate(2026, 5, 15),
    onSelect,
    captionLayout,
    showOutsideDays,
    numberOfMonths,
    required,
    disabled,
  }: {
    mode?: CalendarMode
    size?: CalendarSize
    selected?: CalendarSelectedInput
    defaultSelected?: CalendarSelectedInput
    month?: CalendarDate
    onSelect?: (value: CalendarSelection | undefined) => void
    captionLayout?: CalendarCaptionLayout
    showOutsideDays?: boolean
    numberOfMonths?: number
    required?: boolean
    disabled?: Matcher
  } = $props()
</script>

<Calendar
  {mode}
  {size}
  {selected}
  {defaultSelected}
  {month}
  {onSelect}
  {captionLayout}
  {showOutsideDays}
  {numberOfMonths}
  {required}
  {disabled}
/>
