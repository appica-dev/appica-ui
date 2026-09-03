<script lang="ts">
  import { CalendarDate, CalendarDateTime, type DateValue } from '@internationalized/date'
  import { DatePicker, Field, FieldError, FieldLabel, type DateRange } from '@appica/ui-svelte'

  const today = new CalendarDate(2026, 8, 27)

  let picked = $state<DateValue | undefined>(today)
  let withTime = $state<DateValue | undefined>(new CalendarDateTime(2026, 8, 27, 14, 30))
  let trip = $state<DateRange | undefined>({
    from: new CalendarDate(2026, 8, 10),
    to: new CalendarDate(2026, 8, 17),
  })
  let many = $state<DateValue[] | undefined>([new CalendarDate(2026, 8, 12), new CalendarDate(2026, 8, 18)])
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Date picker</h2>

  <Field class="max-w-sm">
    <FieldLabel>Single</FieldLabel>
    <DatePicker bind:value={picked} defaultPlaceholder={today} />
  </Field>
  <p class="text-foreground-subtle text-sm">Value: {picked?.toString() ?? 'none'}</p>

  <div class="flex max-w-sm flex-col gap-2">
    <p class="text-foreground-muted text-sm">With time ({withTime?.toString() ?? 'none'})</p>
    <DatePicker bind:value={withTime} showTime hourCycle={24} defaultPlaceholder={today} />
  </div>

  <div class="flex max-w-sm flex-col gap-2">
    <p class="text-foreground-muted text-sm">
      Range ({trip?.from?.toString() ?? 'none'} - {trip?.to?.toString() ?? 'none'})
    </p>
    <DatePicker type="range" bind:value={trip} defaultPlaceholder={today} />
  </div>

  <div class="flex max-w-sm flex-col gap-2">
    <p class="text-foreground-muted text-sm">Multiple</p>
    <DatePicker type="multiple" bind:value={many} clearable placeholder="Pick dates" defaultPlaceholder={today} />
  </div>

  <Field class="max-w-sm" invalid>
    <FieldLabel>Invalid</FieldLabel>
    <DatePicker />
    <FieldError>Pick a date.</FieldError>
  </Field>
</section>
