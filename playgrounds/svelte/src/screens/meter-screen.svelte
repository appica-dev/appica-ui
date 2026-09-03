<script lang="ts">
  import {
    DirectionProvider,
    Input,
    Meter,
    MeterLabel,
    MeterProgress,
    MeterValue,
    Switch,
  } from '@appica/ui-svelte'

  const USAGE = [
    { label: 'Operations', value: 32 },
    { label: 'Marketing', value: 64 },
    { label: 'Infrastructure', value: 94 },
  ] as const

  const SKILLS = [
    { label: 'TypeScript', value: 90 },
    { label: 'React', value: 82 },
    { label: 'CSS', value: 70 },
    { label: 'Rust', value: 38 },
  ] as const

  const LEVELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'] as const

  let password = $state('')
  let dir: 'ltr' | 'rtl' = $state('ltr')
  const score = $derived(scorePassword(password))

  function scorePassword(value: string) {
    if (value.length < 3) return 0
    let next = 1
    if (value.length >= 10) next++
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) next++
    if (/[0-9]/.test(value) || /[^A-Za-z0-9]/.test(value)) next++
    return next
  }
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Meter</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Default</p>
    <Meter value={64} class="w-72 max-w-full">
      <MeterLabel>Storage</MeterLabel>
      <MeterValue />
      <MeterProgress />
    </Meter>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Status thresholds</p>
    <div class="flex w-72 max-w-full flex-col gap-5">
      {#each USAGE as item (item.label)}
        <Meter value={item.value} low={40} high={75} optimum={10}>
          <MeterLabel>{item.label}</MeterLabel>
          <MeterValue />
          <MeterProgress />
        </Meter>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Formatting the value</p>
    <div class="flex w-72 max-w-full flex-col gap-6">
      <Meter
        value={1280}
        max={2000}
        format={{ style: 'currency', currency: 'USD' }}
        locale="en-US"
        low={1000}
        high={1800}
        optimum={0}
      >
        <MeterLabel>Monthly budget</MeterLabel>
        <MeterValue />
        <MeterProgress />
      </Meter>

      <Meter value={3.4} max={8} format={{ style: 'unit', unit: 'gigabyte', maximumFractionDigits: 1 }} locale="en-US">
        <MeterLabel>Backup size</MeterLabel>
        <MeterValue>
          {#snippet children(formatted)}
            {formatted} of 8 GB
          {/snippet}
        </MeterValue>
        <MeterProgress />
      </Meter>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Password strength (controlled)</p>
    <div class="flex w-72 max-w-full flex-col gap-2">
      <Input
        type="password"
        autocomplete="new-password"
        bind:value={password}
        placeholder="Choose a password"
        aria-label="Password"
      >
        {#snippet start()}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.85"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            class="size-[1em]"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        {/snippet}
      </Input>
      <Meter
        value={score}
        max={4}
        low={2}
        high={2}
        optimum={4}
        aria-label="Password strength"
        statusClassNames={{
          invalid: 'bg-error-emphasis',
          suboptimum: 'bg-warning-emphasis',
          optimum: 'bg-success-emphasis',
        }}
      >
        <MeterValue class="text-foreground-muted text-xs">
          {#snippet children(_formatted, current)}
            {LEVELS[current]}
          {/snippet}
        </MeterValue>
        <MeterProgress />
      </Meter>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Minimal</p>
    <div class="flex w-64 max-w-full flex-col gap-3">
      {#each SKILLS as skill (skill.label)}
        <Meter value={skill.value} class="gap-1">
          <MeterLabel class="text-foreground text-xs font-normal">{skill.label}</MeterLabel>
          <MeterProgress class="h-1" />
        </Meter>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        <Meter value={64} class="w-72 max-w-full">
          <MeterLabel>Storage</MeterLabel>
          <MeterValue />
          <MeterProgress />
        </Meter>
      </div>
    </DirectionProvider>
  </div>
</section>
