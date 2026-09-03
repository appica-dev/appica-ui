<script lang="ts">
  import { onMount } from 'svelte'
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.85"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              data-icon="start"
            >
              <path
                d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
              ></path>
              <path d="M20 3v4"></path>
              <path d="M22 5h-4"></path>
              <path d="M4 17v2"></path>
              <path d="M5 18H3"></path>
            </svg>
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.85"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
          <path d="M8 16H3v5"></path>
        </svg>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.85"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              data-icon="start"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M8 16H3v5"></path>
            </svg>
            Reload
          </Button>
        </div>
      {/if}
    </div>
  </div>
</section>
