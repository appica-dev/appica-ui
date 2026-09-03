<script lang="ts">
  import { Time } from '@internationalized/date'
  import { Field, FieldError, FieldLabel, TimeField } from '@appica/ui-svelte'

  let start = $state<Time | undefined>(new Time(9, 30))
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Time field</h2>

  <Field class="max-w-xs" name="start">
    <FieldLabel>Start time (24h)</FieldLabel>
    <TimeField bind:value={start} hourCycle={24} />
  </Field>
  <p class="text-foreground-subtle text-sm">Value: {start?.toString() ?? 'none'}</p>

  <div class="flex max-w-xs flex-col gap-2">
    <p class="text-foreground-muted text-sm">12-hour</p>
    <TimeField hourCycle={12} defaultValue={new Time(14, 5)} />
  </div>

  <div class="flex max-w-xs flex-col gap-2">
    <p class="text-foreground-muted text-sm">Seconds</p>
    <TimeField hourCycle={24} granularity="second" defaultValue={new Time(9, 30, 45)} />
  </div>

  <Field class="max-w-xs" invalid>
    <FieldLabel>Invalid</FieldLabel>
    <TimeField hourCycle={24} />
    <FieldError>Enter a valid time.</FieldError>
  </Field>
</section>
