<script lang="ts">
  import { onMount } from 'svelte'
  import { Refresh, Sparkles } from '@appica/icons-svelte'
  import { Button, GradientGlow, Spinner, buttonVariants } from '@appica/ui-svelte'

  const VARIANTS = ['circular', 'dots', 'sparkle'] as const
  const SIZES = ['text-xl', 'text-3xl', 'text-5xl', 'text-7xl'] as const

  let saving = $state(false)
  let thinking = $state(false)
  let refreshing = $state(false)
  let panelLoading = $state(true)
  let saveTimer: ReturnType<typeof setTimeout> | undefined
  let askTimer: ReturnType<typeof setTimeout> | undefined
  let refreshTimer: ReturnType<typeof setTimeout> | undefined
  let panelTimer: ReturnType<typeof setTimeout> | undefined

  function save() {
    if (saveTimer) clearTimeout(saveTimer)
    saving = true
    saveTimer = setTimeout(() => (saving = false), 1800)
  }

  function ask() {
    if (askTimer) clearTimeout(askTimer)
    thinking = true
    askTimer = setTimeout(() => (thinking = false), 5000)
  }

  function refresh() {
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshing = true
    refreshTimer = setTimeout(() => (refreshing = false), 1500)
  }

  function startPanelLoad() {
    if (panelTimer) clearTimeout(panelTimer)
    panelLoading = true
    panelTimer = setTimeout(() => (panelLoading = false), 1600)
  }

  onMount(() => {
    startPanelLoad()
    return () => {
      if (saveTimer) clearTimeout(saveTimer)
      if (askTimer) clearTimeout(askTimer)
      if (refreshTimer) clearTimeout(refreshTimer)
      if (panelTimer) clearTimeout(panelTimer)
    }
  })
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Spinner</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex items-center gap-10">
      {#each VARIANTS as variant (variant)}
        <div class="flex flex-col items-center gap-3">
          <Spinner {variant} />
          <span class="text-foreground-muted text-xs">{variant}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Sizing</p>
    <div class="flex items-end gap-8">
      {#each SIZES as size (size)}
        <Spinner class={size} />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Color</p>
    <div class="flex items-center gap-8 text-4xl">
      <Spinner />
      <span class="text-violet-500">
        <Spinner currentColor />
      </span>
      <span class="text-success-emphasis">
        <Spinner currentColor />
      </span>
      <span class="text-error-emphasis">
        <Spinner currentColor />
      </span>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">In a button</p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <Button onclick={save} disabled={saving} class="min-w-34">
        {#if saving}
          <Spinner currentColor class="text-[1.2em]" />
        {/if}
        {saving ? 'Saving…' : 'Save changes'}
      </Button>

      <GradientGlow reveal={thinking} border blur="md" speed={3} class="rounded-full">
        <button
          type="button"
          onclick={ask}
          class={[buttonVariants({ variant: 'outline', size: 'md' }), 'rounded-full']}
        >
          {#if thinking}
            <Spinner variant="sparkle" currentColor data-icon="start" class="text-lg" />
          {:else}
            <Sparkles data-icon="start" />
          {/if}
          {thinking ? 'Thinking…' : 'Ask AI'}
        </button>
      </GradientGlow>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Refresh button</p>
    <Button variant="outline" size="icon-md" aria-label="Refresh data" disabled={refreshing} onclick={refresh}>
      {#if refreshing}
        <Spinner variant="dots" currentColor class="text-[1.25em]" />
      {:else}
        <Refresh />
      {/if}
    </Button>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Loading a panel</p>
    <div class="border-border bg-background w-72 rounded-xl border p-5">
      {#if panelLoading}
        <div class="flex h-28 items-center justify-center">
          <Spinner variant="circular" class="text-4xl" />
        </div>
      {:else}
        <div class="flex h-28 flex-col justify-between">
          <div>
            <p class="text-foreground-intense font-semibold">Production</p>
            <p class="text-success-emphasis text-sm">All systems operational</p>
            <p class="text-foreground-muted mt-1 text-xs">Synced just now</p>
          </div>
          <Button variant="soft" size="sm" class="self-start" onclick={startPanelLoad}>
            <Refresh data-icon="start" />
            Reload
          </Button>
        </div>
      {/if}
    </div>
  </div>
</section>
