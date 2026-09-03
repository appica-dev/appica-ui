<script lang="ts">
  import { CalendarDate, CalendarDateTime, getLocalTimeZone, toCalendarDate, type DateValue } from '@internationalized/date'
  import { DateField, DirectionProvider, Field, FieldError, FieldLabel, Switch } from '@appica/ui-svelte'

  const variants = ['outline', 'soft'] as const
  const sizes = ['sm', 'md', 'lg'] as const
  const locales = [
    { locale: 'en-US', label: 'en-US' },
    { locale: 'de-DE', label: 'de-DE' },
    { locale: 'sv-SE', label: 'sv-SE' },
    { locale: 'en-GB', label: 'en-GB' },
  ] as const

  const june23 = new CalendarDate(2026, 6, 23)
  const june23At1430 = new CalendarDateTime(2026, 6, 23, 14, 30)

  let date = $state.raw<DateValue | undefined>(new CalendarDate(2026, 6, 23))
  let dir: 'ltr' | 'rtl' = $state('ltr')

  function formatValue(value: DateValue | undefined) {
    if (!value) return 'none'
    return toCalendarDate(value).toDate(getLocalTimeZone()).toLocaleDateString()
  }
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Date field</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <DateField class="max-w-50" defaultValue={june23} />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex max-w-50 flex-wrap items-center gap-4">
      {#each variants as variant (variant)}
        <DateField defaultValue={june23} {variant} />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex max-w-50 flex-wrap items-center gap-4">
      {#each sizes as size (size)}
        <DateField defaultValue={june23} {size} />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Locales</p>
    <div class="flex max-w-50 flex-wrap items-center gap-4">
      {#each locales as item (item.locale)}
        <div class="flex w-full flex-col gap-1">
          <p class="text-foreground-subtle text-xs">{item.label}</p>
          <DateField defaultValue={june23} locale={item.locale} />
        </div>
      {/each}
    </div>
  </div>

  <div class="flex w-full max-w-50 flex-col gap-3">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <DateField bind:value={date} />
    <p class="text-foreground-muted w-full text-sm">
      Value: <span class="text-foreground font-medium">{formatValue(date)}</span>
    </p>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With an icon</p>
    <DateField class="max-w-50" defaultValue={june23}>
      {#snippet start()}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      {/snippet}
    </DateField>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled, read-only & error</p>
    <div class="flex w-full max-w-40 flex-wrap items-center gap-4">
      <DateField defaultValue={june23} disabled />
      <DateField defaultValue={june23} readonly />
      <DateField defaultValue={june23} aria-invalid />
    </div>
    <Field class="max-w-40" invalid>
      <FieldLabel>Invalid</FieldLabel>
      <DateField defaultValue={june23} />
      <FieldError>Enter a valid date.</FieldError>
    </Field>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With time</p>
    <p class="text-foreground-subtle text-xs">CalendarDateTime sets the value type. Granularity defaults to minute.</p>
    <DateField class="max-w-70" hourCycle={24} defaultValue={june23At1430} />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Placeholder</p>
    <p class="text-foreground-subtle text-xs">Empty field. Placeholder type is CalendarDateTime, so time segments render.</p>
    <DateField class="max-w-70" hourCycle={24} placeholder={june23At1430} />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="max-w-50">
        <DateField defaultValue={june23} />
      </div>
    </DirectionProvider>
  </div>
</section>
