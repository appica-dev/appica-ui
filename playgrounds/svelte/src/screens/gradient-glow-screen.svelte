<script lang="ts">
  import { onDestroy } from 'svelte'
  import { Sparkles } from '@appica/icons-svelte'
  import { Button, GradientGlow, Spinner } from '@appica/ui-svelte'

  const PALETTES = [
    { label: 'Sunset', from: '#FCA5A5', via: '#FDC49B', to: '#FCE3A6' },
    { label: 'Ocean', from: '#9DE7D8', via: '#9CC0F9', to: '#BEB0F7' },
    { label: 'Candy', from: '#F0ABFC', via: '#C4B5FD', to: '#93C5FD' },
  ] as const

  const LEVELS = ['md', 'lg', '2xl'] as const

  let loading = $state(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function run() {
    if (timer) clearTimeout(timer)
    loading = true
    timer = setTimeout(() => (loading = false), 5000)
  }

  onDestroy(() => {
    if (timer) clearTimeout(timer)
  })
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">GradientGlow</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Basic glow</p>
    <GradientGlow class="w-full max-w-80">
      <div
        class="bg-background text-foreground-intense flex min-h-32 w-full items-center justify-center rounded-2xl px-6 text-center text-sm font-medium"
      >
        How can I assist you today?
      </div>
    </GradientGlow>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Animated gradient border</p>
    <GradientGlow border blur="xl" class="w-full max-w-80">
      <div
        class="bg-background text-foreground-intense flex min-h-32 w-full items-center justify-center rounded-2xl px-6 text-center text-sm font-medium"
      >
        Smart comparison
      </div>
    </GradientGlow>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Custom colors</p>
    <div class="flex flex-wrap items-center justify-center gap-8">
      {#each PALETTES as p (p.label)}
        <GradientGlow from={p.from} via={p.via} to={p.to}>
          <div
            class="bg-background text-foreground-intense flex size-28 items-center justify-center rounded-2xl text-sm font-medium"
          >
            {p.label}
          </div>
        </GradientGlow>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Blur / softness</p>
    <div class="flex flex-wrap items-center justify-center gap-10">
      {#each LEVELS as blur (blur)}
        <GradientGlow {blur}>
          <div
            class="bg-background text-foreground-intense flex size-28 items-center justify-center rounded-2xl text-sm font-medium"
          >
            blur="{blur}"
          </div>
        </GradientGlow>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Reveal on interaction</p>
    <div class="flex flex-wrap items-center justify-center gap-8">
      <GradientGlow revealOn="hover" pressScale border showOnTouch blur="md" class="rounded-full">
        <Button variant="outline" size="lg" class="rounded-full">Hover me</Button>
      </GradientGlow>
      <GradientGlow revealOn="press" pressScale border blur="md" class="rounded-full">
        <Button variant="outline" size="lg" class="rounded-full">Press me</Button>
      </GradientGlow>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Controlled (loading state)</p>
    <div class="flex flex-wrap items-center">
      <GradientGlow reveal={loading} border blur="md" speed={3} class="rounded-full">
        <Button variant="outline" size="lg" class="rounded-full" onclick={run}>
          {#if loading}
            <Spinner variant="sparkle" currentColor data-icon="start" class="text-xl" />
          {:else}
            <Sparkles data-icon="start" />
          {/if}
          {loading ? 'Thinking…' : 'Ask AI'}
        </Button>
      </GradientGlow>
    </div>
  </div>
</section>
