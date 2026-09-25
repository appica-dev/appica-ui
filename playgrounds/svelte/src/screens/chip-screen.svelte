<script lang="ts">
  import { Check, CircleCheck, Plus, StarFilled } from '@appica/icons-svelte'
  import { Button, Chip, ChipGroup, DirectionProvider, Switch, type ChipGroupHandle } from '@appica/ui-svelte'

  const variants = ['soft', 'outline', 'primary', 'secondary', 'destructive'] as const
  const sizes = [
    { size: 'sm', label: 'Small' },
    { size: 'md', label: 'Medium' },
    { size: 'lg', label: 'Large' },
  ] as const
  const initialTags = ['Design', 'Engineering', 'Marketing', 'Sales']
  const filterOptions = ['All', 'Active', 'Completed', 'Archived']
  const groupFilters = ['React', 'TypeScript', 'Tailwind', 'Motion', 'Base UI']

  let tags = $state([...initialTags])
  let selected = $state('Active')
  let active = $state([...groupFilters])
  let group: ChipGroupHandle | undefined = $state()
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

{#snippet plusIcon()}
  <Plus data-icon="start" />
{/snippet}

{#snippet checkIcon()}
  <Check data-icon="start" />
{/snippet}

{#snippet circleCheckIcon()}
  <CircleCheck data-icon="start" />
{/snippet}

{#snippet starIcon()}
  <StarFilled data-icon="end" />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Chip</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <Chip>Label</Chip>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex flex-wrap items-center gap-2">
      {#each variants as variant (variant)}
        <Chip {variant} class="capitalize">{variant}</Chip>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex flex-wrap items-center gap-2">
      {#each sizes as item (item.size)}
        <Chip size={item.size}>{item.label}</Chip>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With an icon</p>
    <div class="flex flex-wrap items-center gap-2">
      <Chip variant="soft">
        {@render plusIcon()}
        New
      </Chip>
      <Chip variant="primary">
        {@render circleCheckIcon()}
        Verified
      </Chip>
      <Chip variant="outline">
        4.9
        {@render starIcon()}
      </Chip>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Dismissible</p>
    <div class="flex min-h-8 flex-wrap items-center gap-2">
      {#if tags.length === 0}
        <button
          type="button"
          onclick={() => (tags = [...initialTags])}
          class="text-foreground-muted hover:text-foreground text-sm"
        >
          Restore tags
        </button>
      {:else}
        {#each tags as tag (tag)}
          <Chip dismissible closeLabel={`Remove ${tag}`} onDismiss={() => (tags = tags.filter((t) => t !== tag))}>
            {tag}
          </Chip>
        {/each}
      {/if}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Selectable filters</p>
    <div class="flex flex-wrap items-center gap-2">
      {#each filterOptions as option (option)}
        {@const isSelected = option === selected}
        <Chip
          variant={isSelected ? 'primary' : 'outline'}
          aria-pressed={isSelected}
          onclick={() => (selected = option)}
        >
          {#if isSelected}
            {@render checkIcon()}
          {/if}
          {option}
        </Chip>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Chip group</p>
    <div class="flex flex-col items-start gap-3">
      <ChipGroup bind:this={group} variant="outline">
        {#each active as filter (filter)}
          <Chip dismissible onDismiss={() => (active = active.filter((f) => f !== filter))}>
            {filter}
          </Chip>
        {/each}
      </ChipGroup>
      <div class="flex gap-2">
        <Button size="sm" variant="ghost" onclick={() => group?.clearAll()} disabled={active.length === 0}>
          Clear all
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onclick={() => (active = [...groupFilters])}
          disabled={active.length === groupFilters.length}
        >
          Reset
        </Button>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">As a link</p>
    <div class="flex flex-wrap items-center gap-2">
      <Chip href="#design">#design</Chip>
      <Chip href="#engineering">#engineering</Chip>
      <Chip variant="primary" href="#featured">#featured</Chip>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="flex flex-wrap items-center gap-2">
        <Chip dismissible>Design</Chip>
        <Chip variant="primary">Featured</Chip>
      </div>
    </DirectionProvider>
  </div>
</section>
