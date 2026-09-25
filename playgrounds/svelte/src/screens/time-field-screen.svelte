<script lang="ts">
  import { Time } from '@internationalized/date'
  import { Clock } from '@appica/icons-svelte'
  import { DirectionProvider, Field, FieldError, Switch, TimeField } from '@appica/ui-svelte'

  const variants = ['outline', 'soft'] as const
  const sizes = ['sm', 'md', 'lg'] as const
  const morning = new Time(9, 30)
  const afternoon = new Time(13, 45, 30)

  let time = $state<Time | undefined>(morning)
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

{#snippet clockIcon()}
  <Clock data-icon="start" />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">TimeField</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex w-full max-w-40 flex-wrap items-center gap-4">
      {#each variants as variant (variant)}
        <TimeField defaultValue={morning} {variant} />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex w-full max-w-40 flex-wrap items-center gap-4">
      {#each sizes as size (size)}
        <TimeField defaultValue={morning} {size} />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Formats</p>
    <div class="flex w-full max-w-40 flex-wrap items-center gap-4">
      <TimeField defaultValue={afternoon} hourCycle={24} />
      <TimeField defaultValue={afternoon} hourCycle={24} granularity="second" />
      <TimeField defaultValue={afternoon} hourCycle={12} />
      <TimeField defaultValue={afternoon} hourCycle={12} granularity="second" />
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <div class="flex w-full max-w-40 flex-col gap-3">
      <TimeField bind:value={time} />
      <p class="text-foreground-muted text-sm">
        Value: <span class="text-foreground font-medium">{time?.toString() ?? 'null'}</span>
      </p>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With an icon</p>
    <TimeField class="max-w-40" defaultValue={morning}>
      {#snippet start()}
        {@render clockIcon()}
      {/snippet}
    </TimeField>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled, read-only and error states</p>
    <div class="flex w-full max-w-40 flex-wrap items-center gap-4">
      <TimeField defaultValue={morning} disabled />
      <TimeField defaultValue={morning} readOnly />
      <TimeField defaultValue={morning} aria-invalid />
    </div>
    <Field class="max-w-40" invalid>
      <TimeField defaultValue={morning} />
      <FieldError>Enter a valid time.</FieldError>
    </Field>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="max-w-40">
        <TimeField defaultValue={morning} />
      </div>
    </DirectionProvider>
  </div>
</section>
