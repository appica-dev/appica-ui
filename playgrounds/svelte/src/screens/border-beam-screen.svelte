<script lang="ts">
  import { onMount } from 'svelte'
  import { Sparkles } from '@appica/icons-svelte'
  import { BorderBeam, Button, DirectionProvider, Spinner, Switch } from '@appica/ui-svelte'

  const CARD =
    'bg-background border-border text-foreground flex min-h-24 items-center justify-center rounded-2xl border px-5 text-center text-sm'
  const DELAYS = [0, -2, -4] as const
  const COLORS = [
    { label: 'Primary', color: undefined },
    { label: 'Secondary', color: 'var(--secondary-emphasis)' },
    { label: 'Success', color: 'var(--success-emphasis)' },
    { label: 'Custom', color: '#A78BFA' },
  ] as const

  let loading = $state(false)
  let dir: 'ltr' | 'rtl' = $state('ltr')
  let timer: ReturnType<typeof setTimeout> | undefined

  function run() {
    if (timer) clearTimeout(timer)
    loading = true
    timer = setTimeout(() => (loading = false), 5000)
  }

  onMount(() => {
    return () => {
      if (timer) clearTimeout(timer)
    }
  })
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">BorderBeam</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Basic beam</p>
    <BorderBeam class="w-full max-w-70 rounded-2xl">
      <div
        class="bg-background border-border text-foreground-intense flex min-h-32 items-center justify-center rounded-2xl border px-6 text-center text-sm font-medium"
      >
        Syncing your workspace
      </div>
    </BorderBeam>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Color</p>
    <div class="flex flex-wrap items-center justify-center gap-6">
      {#each COLORS as item (item.label)}
        <BorderBeam class="w-40 rounded-2xl" color={item.color} length={20}>
          <div class={CARD}>{item.label}</div>
        </BorderBeam>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Length, thickness, and speed</p>
    <div class="flex flex-wrap items-center justify-center gap-6">
      <BorderBeam class="w-44 rounded-2xl" length={3} speed={3}>
        <div class={CARD}>Short and quick</div>
      </BorderBeam>
      <BorderBeam class="w-44 rounded-2xl" length={30} speed={10}>
        <div class={CARD}>Long and slow</div>
      </BorderBeam>
      <BorderBeam class="w-44 rounded-2xl" thickness={3}>
        <div class={CARD}>3px thick</div>
      </BorderBeam>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Staggering a group</p>
    <div class="flex flex-wrap items-center justify-center gap-6">
      {#each DELAYS as delay (delay)}
        <BorderBeam {delay} class="w-40 rounded-2xl">
          <div
            class="bg-background border-border text-foreground flex min-h-28 items-center justify-center rounded-2xl border px-5 text-center text-sm"
          >
            delay={delay}
          </div>
        </BorderBeam>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Reveal on interaction</p>
    <div class="flex flex-wrap items-center justify-center gap-8">
      <BorderBeam revealOn="hover" showOnTouch pressScale class="rounded-full">
        <Button variant="outline" size="lg" class="rounded-full">Hover me</Button>
      </BorderBeam>
      <BorderBeam revealOn="press" pressScale class="rounded-full">
        <Button variant="outline" size="lg" class="rounded-full">Press me</Button>
      </BorderBeam>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Controlled (loading state)</p>
    <BorderBeam
      reveal={loading}
      pressScale
      color="#A78BFA"
      length={15}
      thickness={1.5}
      speed={2}
      class="rounded-full"
    >
      <Button variant="outline" size="lg" class="rounded-full" onclick={run}>
        {#if loading}
          <Spinner variant="sparkle" currentColor data-icon="start" class="text-xl" />
        {:else}
          <Sparkles data-icon="start" />
        {/if}
        {loading ? 'Thinking…' : 'Ask AI'}
      </Button>
    </BorderBeam>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        <BorderBeam class="w-full max-w-70 rounded-2xl">
          <div
            class="bg-background border-border text-foreground-intense flex min-h-32 items-center justify-center rounded-2xl border px-6 text-center text-sm font-medium"
          >
            Syncing your workspace
          </div>
        </BorderBeam>
      </div>
    </DirectionProvider>
  </div>
</section>
