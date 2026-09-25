<script lang="ts">
  import { onMount } from 'svelte'
  import { Refresh, UserFilled } from '@appica/icons-svelte'
  import {
    Avatar,
    AvatarBadge,
    AvatarFallback,
    AvatarGroup,
    AvatarImage,
    Button,
    DirectionProvider,
    Skeleton,
    Switch,
  } from '@appica/ui-svelte'

  const SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const

  const people = [
    { src: 'https://i.pravatar.cc/150?img=1', alt: 'Sarah Jenkins', initials: 'SJ' },
    { src: 'https://i.pravatar.cc/150?img=12', alt: 'Liam Hudson', initials: 'LH' },
    { src: 'https://i.pravatar.cc/150?img=13', alt: 'Mateo Rossi', initials: 'MR' },
    { src: 'https://i.pravatar.cc/150?img=5', alt: 'Ava Thompson', initials: 'AT' },
  ] as const

  let src = $state<string | undefined>()
  let nonce = $state(0)
  let dir: 'ltr' | 'rtl' = $state('ltr')
  let loadTimer: ReturnType<typeof setTimeout> | undefined

  function startLoad() {
    src = undefined
    if (loadTimer) clearTimeout(loadTimer)
    loadTimer = setTimeout(() => {
      src = `https://i.pravatar.cc/150?img=9&reload=${nonce}`
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

{#snippet userIcon()}
  <UserFilled />
{/snippet}

{#snippet groupRow()}
  <AvatarGroup size="md">
    {#each people as person (person.src)}
      <Avatar>
        <AvatarImage src={person.src} alt={person.alt} />
        <AvatarFallback>{person.initials}</AvatarFallback>
      </Avatar>
    {/each}
    <Avatar>
      <AvatarFallback class="text-foreground-muted text-sm">+5</AvatarFallback>
    </Avatar>
  </AvatarGroup>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Avatar</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Default</p>
    <Avatar size="lg">
      <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="Sarah Jenkins" />
      <AvatarFallback>SJ</AvatarFallback>
    </Avatar>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Fallback</p>
    <div class="flex items-center gap-4">
      <Avatar size="lg">
        <AvatarImage src="https://example.com/does-not-exist.jpg" alt="Sarah Jenkins" />
        <AvatarFallback>SJ</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>
          {@render userIcon()}
        </AvatarFallback>
      </Avatar>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      {#each SIZES as size (size)}
        <Avatar {size}>
          <AvatarImage src="https://i.pravatar.cc/150?img=12" alt="Daniel Reyes" />
          <AvatarFallback>DR</AvatarFallback>
        </Avatar>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Custom size</p>
    <div class="flex items-center gap-4">
      <Avatar size={28}>
        <AvatarImage src="https://i.pravatar.cc/150?img=5" alt="Ava Thompson" />
        <AvatarFallback>AT</AvatarFallback>
      </Avatar>
      <Avatar size={44}>
        <AvatarImage src="https://i.pravatar.cc/150?img=5" alt="Ava Thompson" />
        <AvatarFallback>AT</AvatarFallback>
      </Avatar>
      <Avatar size={72}>
        <AvatarImage src="https://i.pravatar.cc/150?img=5" alt="Ava Thompson" />
        <AvatarFallback>AT</AvatarFallback>
      </Avatar>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Shape</p>
    <div class="flex items-center gap-4">
      <Avatar size="lg" shape="circle">
        <AvatarImage src="https://i.pravatar.cc/150?img=13" alt="Mateo Rossi" />
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
      <Avatar size="lg" shape="rounded">
        <AvatarImage src="https://i.pravatar.cc/150?img=13" alt="Mateo Rossi" />
        <AvatarFallback>MR</AvatarFallback>
      </Avatar>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Status badge</p>
    <div class="flex items-center gap-4">
      <Avatar size="lg">
        <AvatarImage src="https://i.pravatar.cc/150?img=8" alt="Liam Hudson" />
        <AvatarFallback>LH</AvatarFallback>
        <AvatarBadge />
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="https://i.pravatar.cc/150?img=9" alt="Emma Garcia" />
        <AvatarFallback>EG</AvatarFallback>
        <AvatarBadge animate />
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="https://i.pravatar.cc/150?img=11" alt="Lucas Müller" />
        <AvatarFallback>LM</AvatarFallback>
        <AvatarBadge class="text-foreground-subtle" />
      </Avatar>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Avatar group</p>
    {@render groupRow()}
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Vertical group</p>
    <AvatarGroup size="md" orientation="vertical">
      {#each people.slice(0, 3) as person (person.src)}
        <Avatar>
          <AvatarImage src={person.src} alt={person.alt} />
          <AvatarFallback>{person.initials}</AvatarFallback>
        </Avatar>
      {/each}
    </AvatarGroup>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Loading animation</p>
    <div class="flex flex-col items-center gap-4">
      <Avatar size="xl" class="bg-transparent">
        <AvatarImage {src} alt="Emma Garcia" />
        <AvatarFallback>
          <Skeleton class="size-full rounded-[inherit]" />
        </AvatarFallback>
      </Avatar>
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
      <div {dir} class="flex flex-col items-start gap-5">
        <Avatar size="lg">
          <AvatarImage src="https://i.pravatar.cc/150?img=8" alt="Liam Hudson" />
          <AvatarFallback>LH</AvatarFallback>
          <AvatarBadge animate />
        </Avatar>
        {@render groupRow()}
      </div>
    </DirectionProvider>
  </div>
</section>
