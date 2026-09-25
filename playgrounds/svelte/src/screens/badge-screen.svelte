<script lang="ts">
  import { Bell, BellRinging, Bolt, Check, Crown, Flame, Star } from '@appica/icons-svelte'
  import { Badge, Button, DirectionProvider, Switch } from '@appica/ui-svelte'

  const variants = [
    { variant: 'primary', label: 'Primary' },
    { variant: 'primary-outline', label: 'Primary outline' },
    { variant: 'secondary', label: 'Secondary' },
    { variant: 'soft', label: 'Soft' },
    { variant: 'outline', label: 'Outline' },
    { variant: 'error', label: 'Error' },
    { variant: 'success', label: 'Success' },
    { variant: 'warning', label: 'Warning' },
    { variant: 'info', label: 'Info' },
  ] as const

  const sizes = [
    { size: 'xs', label: 'Extra small' },
    { size: 'sm', label: 'Small' },
    { size: 'md', label: 'Medium' },
    { size: 'lg', label: 'Large' },
  ] as const

  let following = $state(false)
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

{#snippet checkIcon(position?: 'start' | 'end')}
  <Check data-icon={position} />
{/snippet}

{#snippet flameIcon()}
  <Flame data-icon="start" />
{/snippet}

{#snippet bellRingIcon()}
  <BellRinging data-icon="end" />
{/snippet}

{#snippet crownIcon()}
  <Crown data-icon="start" />
{/snippet}

{#snippet starIcon()}
  <Star />
{/snippet}

{#snippet boltIcon()}
  <Bolt />
{/snippet}

{#snippet bellIcon()}
  <Bell />
{/snippet}

{#snippet withIcon()}
  <div class="flex flex-wrap items-center justify-center gap-2">
    <Badge variant="success">
      {@render checkIcon('start')}
      Verified
    </Badge>
    <Badge variant="warning">
      {@render flameIcon()}
      Hot
    </Badge>
    <Badge variant="soft">
      Notification
      {@render bellRingIcon()}
    </Badge>
  </div>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Badge</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <Badge>Badge</Badge>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex flex-wrap items-center justify-center gap-2">
      {#each variants as item (item.variant)}
        <Badge variant={item.variant}>{item.label}</Badge>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">On dark backgrounds</p>
    <div class="relative flex h-44 w-full max-w-66 items-end justify-start overflow-hidden rounded-xl">
      <img
        src="https://picsum.photos/id/1015/576/328"
        alt=""
        class="absolute inset-0 size-full object-cover"
      />
      <div class="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent"></div>
      <Badge variant="light" class="relative m-3">
        {@render crownIcon()}
        Premium
      </Badge>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex flex-wrap items-center justify-center gap-2">
      {#each sizes as item (item.size)}
        <Badge size={item.size}>{item.label}</Badge>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With an icon</p>
    {@render withIcon()}
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Icon only</p>
    <div class="flex flex-wrap items-center justify-center gap-2">
      <Badge variant="success" size="icon-sm" role="img" aria-label="Verified">
        {@render checkIcon()}
      </Badge>
      <Badge variant="primary-outline" size="icon-md" role="img" aria-label="Featured">
        {@render starIcon()}
      </Badge>
      <Badge variant="warning" size="icon-lg" role="img" aria-label="Boosted">
        {@render boltIcon()}
      </Badge>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Notification count</p>
    <div class="relative mt-2 inline-flex w-fit">
      <Button variant="outline" size="icon-md" aria-label="Notifications">
        {@render bellIcon()}
      </Button>
      <Badge
        variant="secondary"
        size="xs"
        class="absolute -inset-e-1.5 -top-1.5 min-w-4 px-1 font-medium"
        aria-label="3 unread notifications"
      >
        3
      </Badge>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Interactive (link or button)</p>
    <div class="flex flex-wrap items-center justify-center gap-2">
      <Badge variant="soft" href="#design">Design</Badge>
      <Badge variant="outline" href="#trending">Trending</Badge>
      <Badge variant={following ? 'primary' : 'primary-outline'} onclick={() => (following = !following)}>
        {following ? 'Following' : 'Follow'}
      </Badge>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="flex flex-col items-start gap-4">
        {@render withIcon()}
        <div class="relative mt-2 inline-flex w-fit">
          <Button variant="outline" size="icon-md" aria-label="Notifications">
            {@render bellIcon()}
          </Button>
          <Badge
            variant="secondary"
            size="xs"
            class="absolute -inset-e-1.5 -top-1.5 min-w-4 px-1 font-medium"
            aria-label="3 unread notifications"
          >
            3
          </Badge>
        </div>
      </div>
    </DirectionProvider>
  </div>
</section>
