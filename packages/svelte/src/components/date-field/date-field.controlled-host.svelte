<script lang="ts">
  import { untrack } from 'svelte'
  import { CalendarDate, type DateValue } from '@internationalized/date'
  import DateField from './date-field.svelte'

  let {
    initial = new CalendarDate(2026, 6, 23),
  }: {
    initial?: DateValue
  } = $props()

  let date = $state.raw<DateValue | undefined>(undefined)
  date = untrack(() => initial)
</script>

<DateField bind:value={date} aria-label="Date" />
<p data-testid="date-value">{date?.toString() ?? 'none'}</p>
<button type="button" onclick={() => (date = new CalendarDate(2030, 1, 5))}>Set January 5</button>
