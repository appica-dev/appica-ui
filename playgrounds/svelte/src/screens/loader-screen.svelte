<script lang="ts">
  import { onMount } from 'svelte'
  import { Button, DirectionProvider, Loader, Switch } from '@appica/ui-svelte'

  const VARIANTS = ['bar', 'dots'] as const
  const SIZES = ['text-xl', 'text-3xl', 'text-5xl', 'text-7xl'] as const
  const ALL = ['Aurora', 'Borealis', 'Cosmos', 'Drift', 'Ember', 'Flux', 'Glow', 'Halo', 'Ion']

  let count = $state(3)
  let loadingMore = $state(false)
  let sectionLoading = $state(true)
  let dir: 'ltr' | 'rtl' = $state('ltr')
  let loadMoreTimer: ReturnType<typeof setTimeout> | undefined
  let sectionTimer: ReturnType<typeof setTimeout> | undefined

  function loadMore() {
    if (loadMoreTimer) clearTimeout(loadMoreTimer)
    loadingMore = true
    loadMoreTimer = setTimeout(() => {
      count = Math.min(count + 3, ALL.length)
      loadingMore = false
    }, 1400)
  }

  function loadSection() {
    if (sectionTimer) clearTimeout(sectionTimer)
    sectionLoading = true
    sectionTimer = setTimeout(() => (sectionLoading = false), 1800)
  }

  onMount(() => {
    loadSection()
    return () => {
      if (loadMoreTimer) clearTimeout(loadMoreTimer)
      if (sectionTimer) clearTimeout(sectionTimer)
    }
  })
</script>

{#snippet inlineStatus()}
  <div class="flex flex-col gap-4 text-sm">
    <span class="text-foreground-muted inline-flex items-center gap-2">
      Syncing your changes
      <Loader variant="dots" currentColor class="text-[1.6em]" aria-hidden="true" />
    </span>
    <span class="text-secondary-emphasis inline-flex items-center gap-2">
      Uploading 3 files
      <Loader variant="bar" currentColor class="text-[1.6em]" aria-hidden="true" />
    </span>
  </div>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Loader</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex items-center gap-12">
      {#each VARIANTS as variant (variant)}
        <div class="flex flex-col items-center gap-3">
          <Loader {variant} />
          <span class="text-foreground-muted text-xs">{variant}</span>
        </div>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Sizing</p>
    <div class="flex flex-wrap items-center gap-8">
      {#each SIZES as size (size)}
        <Loader class={size} />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Color</p>
    <div class="flex items-center gap-12 text-4xl">
      <Loader />
      <span class="text-violet-500">
        <Loader currentColor />
      </span>
      <span class="text-success-emphasis">
        <Loader currentColor />
      </span>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Load more</p>
    <div class="flex w-56 flex-col gap-2">
      <ul class="flex flex-col gap-2">
        {#each ALL.slice(0, count) as item (item)}
          <li
            class="bg-background-subtle border-border-muted text-foreground-emphasis rounded-lg border px-4 py-3 text-sm"
          >
            {item}
          </li>
        {/each}
      </ul>
      {#if count < ALL.length}
        <Button onclick={loadMore} disabled={loadingMore} class="self-center">
          {#if loadingMore}
            <Loader variant="dots" currentColor class="text-3xl" />
          {:else}
            Load more
          {/if}
        </Button>
      {/if}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Section loading</p>
    <div class="border-border bg-background w-80 overflow-hidden rounded-xl border">
      <div class="border-border-muted bg-background-subtle flex items-center justify-between border-b px-4 py-2.5">
        <span class="text-foreground-intense text-sm font-semibold">Revenue</span>
        <Button variant="outline" size="sm" onclick={loadSection} disabled={sectionLoading}>Refresh</Button>
      </div>
      <div class="flex h-32 items-center justify-center p-4">
        {#if sectionLoading}
          <div class="flex flex-col items-center gap-3">
            <Loader variant="bar" class="text-4xl" />
            <span class="text-foreground-muted text-xs">Crunching the numbers…</span>
          </div>
        {:else}
          <div class="text-center">
            <p class="text-foreground-intense mb-0.5 text-3xl font-semibold">$48,250</p>
            <p class="text-success-emphasis text-sm">+12.5% this month</p>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Inline status</p>
    {@render inlineStatus()}
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        {@render inlineStatus()}
      </div>
    </DirectionProvider>
  </div>
</section>
