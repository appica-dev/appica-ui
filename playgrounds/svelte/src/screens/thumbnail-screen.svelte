<script lang="ts">
  import type { Component } from 'svelte'
  import { onMount } from 'svelte'
  import {
    BellFilled,
    BoltFilled,
    Check,
    FolderFilled,
    HeartFilled,
    ImageFilled,
    LayoutGrid,
    MailFilled,
    Music,
    Refresh,
    StarFilled,
    TrashFilled,
  } from '@appica/icons-svelte'
  import { Button, DirectionProvider, Skeleton, Switch, Thumbnail } from '@appica/ui-svelte'

  const SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const
  const CUSTOM_SIZES = [40, 56, 88] as const
  const IMAGE_SRC = 'https://picsum.photos/id/1015/160/160'
  const IMAGE_ALT = 'Snow-capped mountain peak at sunset'
  const SQUIRCLE = 'rounded-[calc(tan(atan2(var(--radius-md),2.5rem))*100%)]'
  const ICON_VARIANTS: {
    variant:
      | 'icon-soft'
      | 'icon-outline'
      | 'icon-primary'
      | 'icon-primary-outline'
      | 'icon-secondary'
      | 'icon-error'
      | 'icon-success'
      | 'icon-warning'
      | 'icon-info'
    Icon: Component
  }[] = [
    { variant: 'icon-soft', Icon: FolderFilled },
    { variant: 'icon-outline', Icon: ImageFilled },
    { variant: 'icon-primary', Icon: BoltFilled },
    { variant: 'icon-primary-outline', Icon: HeartFilled },
    { variant: 'icon-secondary', Icon: StarFilled },
    { variant: 'icon-error', Icon: TrashFilled },
    { variant: 'icon-success', Icon: Check },
    { variant: 'icon-warning', Icon: BellFilled },
    { variant: 'icon-info', Icon: MailFilled },
  ]

  let src = $state<string | undefined>()
  let loaded = $state(false)
  let nonce = $state(0)
  let dir: 'ltr' | 'rtl' = $state('ltr')
  let loadTimer: ReturnType<typeof setTimeout> | undefined

  function startLoad() {
    src = undefined
    loaded = false
    if (loadTimer) clearTimeout(loadTimer)
    loadTimer = setTimeout(() => {
      src = `${IMAGE_SRC}?reload=${nonce}`
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

{#snippet mediaList()}
  <ul class="divide-border border-border w-full max-w-90 divide-y rounded-xl border">
    <li class="flex items-center gap-3 px-4 py-3">
      <Thumbnail size="md" src={IMAGE_SRC} alt="Mountain peak" />
      <div class="flex flex-col">
        <span class="text-foreground-intense text-sm font-medium">Summit.jpg</span>
        <span class="text-foreground-muted text-xs">Image · 2.4 MB</span>
      </div>
    </li>
    <li class="flex items-center gap-3 px-4 py-3">
      <Thumbnail size="md" variant="icon-soft">
        <FolderFilled />
      </Thumbnail>
      <div class="flex flex-col">
        <span class="text-foreground-intense text-sm font-medium">Field notes</span>
        <span class="text-foreground-muted text-xs">Folder · 18 items</span>
      </div>
    </li>
    <li class="flex items-center gap-3 px-4 py-3">
      <Thumbnail size="md" variant="icon-primary">
        <Music />
      </Thumbnail>
      <div class="flex flex-col">
        <span class="text-foreground-intense text-sm font-medium">Trailhead.mp3</span>
        <span class="text-foreground-muted text-xs">Audio · 3:42</span>
      </div>
    </li>
    <li class="flex items-center gap-3 px-4 py-3">
      <Thumbnail size="md" variant="icon-secondary">
        <LayoutGrid />
      </Thumbnail>
      <div class="flex flex-col">
        <span class="text-foreground-intense text-sm font-medium">Moodboard</span>
        <span class="text-foreground-muted text-xs">Album · 24 photos</span>
      </div>
    </li>
  </ul>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Thumbnail</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Default</p>
    <Thumbnail size="xl" src={IMAGE_SRC} alt={IMAGE_ALT} />
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex flex-wrap items-end justify-center gap-4">
      {#each SIZES as size (size)}
        <Thumbnail {size} src={IMAGE_SRC} alt="Mountain peak" />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Custom size</p>
    <div class="flex items-end gap-4">
      {#each CUSTOM_SIZES as size (size)}
        <Thumbnail {size} src={IMAGE_SRC} alt="Mountain peak" />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Shape</p>
    <div class="flex items-center gap-4">
      <Thumbnail size="xl" shape="rounded" src={IMAGE_SRC} alt="Mountain peak" />
      <Thumbnail size="xl" shape="circle" src={IMAGE_SRC} alt="Mountain peak" />
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Icon variants</p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      {#each ICON_VARIANTS as item (item.variant)}
        <Thumbnail variant={item.variant} size="lg">
          <item.Icon />
        </Thumbnail>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Fallback</p>
    <Thumbnail size="xl" src="https://example.com/thumbnail-does-not-exist.jpg" alt="Unavailable image" />
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Media list</p>
    {@render mediaList()}
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Loading</p>
    <div class="flex flex-col items-center gap-4">
      <div class="relative inline-flex">
        <Thumbnail
          size="2xl"
          alt="Mountain peak"
          {src}
          onLoadingStatusChange={(status) => (loaded = status === 'loaded')}
        />
        {#if !loaded}
          <Skeleton class={['absolute inset-0', SQUIRCLE]} />
        {/if}
      </div>
      <Button variant="outline" size="sm" onclick={reload} disabled={!src}>
        <Refresh data-icon="start" />
        Reload
      </Button>
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
        {@render mediaList()}
      </div>
    </DirectionProvider>
  </div>
</section>
