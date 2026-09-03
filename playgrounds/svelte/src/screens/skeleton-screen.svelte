<script lang="ts">
  import { onMount } from 'svelte'
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    DirectionProvider,
    Skeleton,
    Switch,
  } from '@appica/ui-svelte'

  const EFFECTS = ['shimmer', 'pulse', 'none'] as const
  const COLORS = [
    { class: '', label: 'default' },
    { class: 'text-primary', label: 'primary' },
    { class: 'text-secondary-emphasis', label: 'secondary' },
    { class: 'text-error-emphasis', label: 'error' },
    { class: 'text-success-emphasis', label: 'success' },
    { class: 'text-warning-emphasis', label: 'warning' },
    { class: 'text-info-emphasis', label: 'info' },
    { class: 'text-violet-500', label: 'violet' },
  ] as const

  let src = $state<string | undefined>()
  let loaded = $state(false)
  let nonce = $state(0)
  let dir: 'ltr' | 'rtl' = $state('ltr')
  let loadTimer: ReturnType<typeof setTimeout> | undefined

  function startLoad() {
    loaded = false
    src = undefined
    if (loadTimer) clearTimeout(loadTimer)
    loadTimer = setTimeout(() => {
      src = `https://picsum.photos/80?reload=${nonce}`
    }, 2500)
  }

  function reload() {
    nonce += 1
    startLoad()
  }

  onMount(() => {
    startLoad()
    return () => {
      if (loadTimer) clearTimeout(loadTimer)
    }
  })
</script>

{#snippet cardPreview()}
  <div class="border-border bg-background w-full max-w-sm rounded-xl border p-4">
    <Skeleton class="aspect-video w-full rounded-lg" />
    <div class="mt-4 flex items-center gap-3">
      <Skeleton class="size-10 shrink-0 rounded-full" />
      <div class="flex flex-1 flex-col gap-2">
        <Skeleton class="h-3.5 w-2/3" />
        <Skeleton class="h-3 w-1/3" />
      </div>
    </div>
  </div>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Skeleton</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Usage</p>
    <Skeleton class="h-4 w-40" />
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Default</p>
    <Skeleton class="h-28 w-64 rounded-xl" />
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Effects</p>
    <div class="flex flex-wrap items-start justify-center gap-10">
      {#each EFFECTS as effect (effect)}
        <div class="flex flex-col items-center gap-3">
          <Skeleton {effect} class="h-24 w-40 rounded-xl" />
          <span class="text-foreground-muted text-xs">{effect}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Composing shapes</p>
    <div class="flex flex-wrap items-center justify-center gap-6">
      <Skeleton class="size-16 rounded-full" />
      <Skeleton class="size-16 rounded-xl" />
      <Skeleton class="h-10 w-32 rounded-lg" />
      <Skeleton class="h-4 w-40 rounded-full" />
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Text lines</p>
    <div class="flex w-full max-w-sm flex-col gap-2.5">
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-full" />
      <Skeleton class="h-4 w-4/5" />
      <Skeleton class="h-4 w-2/3" />
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Card</p>
    {@render cardPreview()}
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Recoloring</p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      {#each COLORS as color (color.label)}
        <div class="flex flex-col items-center gap-2">
          <Skeleton class={['size-16 rounded-xl', color.class]} />
          <span class="text-foreground-muted text-xs">{color.label}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Independent shimmer</p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      <div class="flex flex-col items-center gap-2">
        <Skeleton class="size-16 rounded-xl" />
        <span class="text-foreground-muted text-xs">surface</span>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Skeleton class="size-16 rounded-xl [--skeleton-highlight:var(--primary)]" />
        <span class="text-foreground-muted text-xs">--skeleton-highlight</span>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Swapping in content</p>
    <div class="flex w-full max-w-sm flex-col gap-4">
      <div class="flex justify-end">
        <Button size="sm" variant="outline" onclick={reload} disabled={!loaded}>
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

      <div
        class="border-border bg-background flex items-center gap-3 rounded-xl border p-4"
        aria-busy={loaded ? undefined : true}
      >
        <Avatar size="lg" class="shrink-0 bg-transparent">
          <AvatarImage {src} alt="Sarah Jenkins" onLoadingStatusChange={(status) => (loaded = status === 'loaded')} />
          <AvatarFallback>
            <Skeleton class="size-full rounded-[inherit]" />
          </AvatarFallback>
        </Avatar>
        <div class="flex flex-1 flex-col gap-1.5">
          {#if loaded}
            <span class="text-foreground-intense -mb-0.5 text-sm font-semibold">Sarah Jenkins</span>
            <span class="text-foreground-muted text-xs">Product designer</span>
          {:else}
            <Skeleton class="h-4 w-2/3" />
            <Skeleton class="h-3 w-2/5" />
          {/if}
        </div>
      </div>
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
        {@render cardPreview()}
      </div>
    </DirectionProvider>
  </div>
</section>
