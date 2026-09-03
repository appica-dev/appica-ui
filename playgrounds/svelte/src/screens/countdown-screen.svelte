<script lang="ts">
  import {
    Button,
    Countdown,
    CountdownSegment,
    DirectionProvider,
    Switch,
    type CountdownUnit,
  } from '@appica/ui-svelte'

  const TARGET = '2027-01-01T00:00:00Z'
  const LABELS = [
    { unit: 'days', label: 'Days' },
    { unit: 'hours', label: 'Hours' },
    { unit: 'minutes', label: 'Minutes' },
    { unit: 'seconds', label: 'Seconds' },
  ] as const satisfies ReadonlyArray<{ unit: CountdownUnit; label: string }>
  const box =
    'bg-background-subtle text-foreground-intense rounded-lg border px-3 py-3.5 font-mono text-2xl font-semibold'

  let done = $state(false)
  let value = $state(8)
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

{#snippet field(unit: CountdownUnit, label: string)}
  <div class="flex flex-col items-center">
    <CountdownSegment {unit} class="text-foreground-intense text-4xl font-semibold" />
    <span class="text-foreground-muted mt-1 text-sm">{label}</span>
  </div>
{/snippet}

{#snippet labeled()}
  <Countdown targetDate={TARGET} class="gap-6" aria-label="Time until 2027">
    {#each LABELS as item (item.unit)}
      {@render field(item.unit, item.label)}
    {/each}
  </Countdown>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Countdown</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Usage</p>
    <Countdown targetDate={TARGET} class="gap-2 text-2xl font-semibold" aria-label="Time until 2027">
      <CountdownSegment unit="days" />
      <span class="text-foreground-muted text-base font-normal">days</span>
      <CountdownSegment unit="hours" />
      <span class="text-foreground-muted text-base font-normal">hours</span>
      <CountdownSegment unit="minutes" />
      <span class="text-foreground-muted text-base font-normal">minutes</span>
      <CountdownSegment unit="seconds" />
      <span class="text-foreground-muted text-base font-normal">seconds</span>
    </Countdown>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Labeled countdown</p>
    {@render labeled()}
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Relative duration</p>
    {#if done}
      <div class="flex flex-col items-center gap-3">
        <p class="text-foreground-intense text-lg font-semibold">Time's up!</p>
        <Button variant="outline" size="sm" onclick={() => (done = false)}>Restart</Button>
      </div>
    {:else}
      <Countdown
        duration={20}
        onComplete={() => (done = true)}
        class="text-foreground-intense gap-1 text-3xl font-semibold"
        aria-label="Offer ends in"
      >
        <CountdownSegment unit="minutes" />
        <span class="text-foreground-muted">:</span>
        <CountdownSegment unit="seconds" />
      </Countdown>
    {/if}
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Custom styling</p>
    <Countdown targetDate={TARGET} class="gap-2" aria-label="Time remaining">
      <CountdownSegment unit="hours" class={box} />
      <span class="text-foreground-muted self-center text-2xl font-semibold">:</span>
      <CountdownSegment unit="minutes" class={box} />
      <span class="text-foreground-muted self-center text-2xl font-semibold">:</span>
      <CountdownSegment unit="seconds" class={box} />
    </Countdown>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Standalone rolling number</p>
    <div class="flex items-center gap-5">
      <CountdownSegment {value} class="text-foreground-intense text-5xl font-semibold" />
      <div class="flex gap-2">
        <Button variant="outline" size="sm" onclick={() => (value = Math.max(0, value - 1))}>-1</Button>
        <Button variant="outline" size="sm" onclick={() => (value += 1)}>+1</Button>
        <Button variant="outline" size="sm" onclick={() => (value += 10)}>+10</Button>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Parts snippet</p>
    <Countdown duration={45} class="text-foreground-intense text-3xl font-semibold" aria-label="Seconds remaining">
      {#snippet children(parts)}
        <span>{parts.seconds}s left</span>
      {/snippet}
    </Countdown>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        {@render labeled()}
      </div>
    </DirectionProvider>
  </div>
</section>
