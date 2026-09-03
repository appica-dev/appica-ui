<script lang="ts">
  import { Button, Chip, ChipGroup, type ChipGroupHandle } from '@appica/ui-svelte'

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
</script>

{#snippet plusIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    data-icon="start"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
{/snippet}

{#snippet checkIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    data-icon="start"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
{/snippet}

{#snippet circleCheckIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    data-icon="start"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
{/snippet}

{#snippet starIcon()}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" data-icon="end">
    <path d="M12 2.5 9.64 8.13l-6.14.54 4.66 4.04-1.4 5.98L12 15.77l5.24 3.02-1.4-5.98 4.66-4.04-6.14-.54L12 2.5z" />
  </svg>
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
</section>
