<script lang="ts">
  import { Bookmark, Search } from '@appica/icons-svelte'
  import {
    Button,
    DirectionProvider,
    Kbd,
    KbdGroup,
    Switch,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    buttonVariants,
  } from '@appica/ui-svelte'

  const SIZES = ['sm', 'md', 'lg'] as const
  const DEFAULT_KEYS = ['Esc', 'Tab', '⌘', '⇧', '↵', 'Space'] as const
  const SHORTCUTS = [
    { action: 'Open command menu', keys: ['⌘', 'K'] },
    { action: 'New file', keys: ['⌘', 'N'] },
    { action: 'Search', keys: ['⌘', 'F'] },
    { action: 'Toggle sidebar', keys: ['⌘', 'B'] },
  ] as const

  let playgroundSize: (typeof SIZES)[number] = $state('md')
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

{#snippet searchIcon()}
  <Search data-icon="start" />
{/snippet}

{#snippet bookmarkIcon()}
  <Bookmark />
{/snippet}

{#snippet shortcutList()}
  <ul class="flex w-full max-w-80 flex-col gap-0.5">
    {#each SHORTCUTS as { action, keys } (action)}
      <li
        class="bg-background-subtle flex items-center justify-between gap-4 px-4 py-2.5 text-sm first:rounded-t-lg last:rounded-b-lg"
      >
        <span>{action}</span>
        <KbdGroup size="sm" dir="ltr">
          {#each keys as key (key)}
            <Kbd>{key}</Kbd>
          {/each}
        </KbdGroup>
      </li>
    {/each}
  </ul>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Kbd</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Playground</p>
    <div class="flex flex-wrap items-center gap-3 text-sm">
      <label class="flex items-center gap-2">
        <span class="text-foreground-muted">Size</span>
        <select bind:value={playgroundSize} class="border-border bg-background rounded-md border px-2 py-1">
          {#each SIZES as size (size)}
            <option value={size}>{size}</option>
          {/each}
        </select>
      </label>
    </div>
    <KbdGroup size={playgroundSize}>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Default</p>
    <div class="flex flex-wrap items-center justify-center gap-2">
      {#each DEFAULT_KEYS as key (key)}
        <Kbd>{key}</Kbd>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex flex-wrap items-center justify-center gap-4">
      {#each SIZES as size (size)}
        <Kbd {size}>⌘ K</Kbd>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Key combinations</p>
    <div class="flex flex-col items-center gap-4 text-sm">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>

      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span class="text-foreground-muted">+</span>
        <Kbd>Alt</Kbd>
        <span class="text-foreground-muted">+</span>
        <Kbd>Del</Kbd>
      </KbdGroup>

      <span class="text-foreground-muted">
        Press
        <KbdGroup size="sm">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        to open the command menu
      </span>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Shortcut list</p>
    {@render shortcutList()}
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Inside a button</p>
    <div class="flex">
      <Button variant="outline" class="gap-3">
        {@render searchIcon()}
        Search
        <Kbd size="sm" data-icon="end" class="-me-0.5">⌘ K</Kbd>
      </Button>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Inside a tooltip</p>
    <div class="flex">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            class={buttonVariants({ variant: 'outline', size: 'icon-md' })}
            aria-label="Save"
          >
            {@render bookmarkIcon()}
          </TooltipTrigger>
          <TooltipContent class="flex items-center gap-2">
            Save
            <Kbd size="sm">⌘ S</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
        {@render shortcutList()}
      </div>
    </DirectionProvider>
  </div>
</section>
