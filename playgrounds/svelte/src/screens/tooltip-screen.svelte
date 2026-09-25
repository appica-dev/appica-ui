<script lang="ts">
  import {
    Bold,
    Bookmark,
    Heart,
    Italic,
    Link,
    Strikethrough,
    Underline,
  } from '@appica/icons-svelte'
  import {
    DirectionProvider,
    Kbd,
    Switch,
    Toolbar,
    ToolbarSeparator,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
    buttonVariants,
  } from '@appica/ui-svelte'

  const SIDES = ['top', 'right', 'bottom', 'left'] as const
  const ALIGNS = ['start', 'center', 'end'] as const
  const ACTIONS = [
    { label: 'Bold', kind: 'bold' },
    { label: 'Italic', kind: 'italic' },
    { label: 'Underline', kind: 'underline' },
    { label: 'Strikethrough', kind: 'strikethrough' },
    { label: 'Link', kind: 'link' },
  ] as const

  let controlledOpen = $state(false)
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

{#snippet heartIcon()}
  <Heart />
{/snippet}

{#snippet bookmarkIcon()}
  <Bookmark />
{/snippet}

{#snippet formatIcon(kind: (typeof ACTIONS)[number]['kind'])}
  {#if kind === 'bold'}
    <Bold />
  {:else if kind === 'italic'}
    <Italic />
  {:else if kind === 'underline'}
    <Underline />
  {:else if kind === 'strikethrough'}
    <Strikethrough />
  {:else if kind === 'link'}
    <Link />
  {/if}
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Tooltip</h2>

  <TooltipProvider>
    <div class="flex flex-col gap-3">
      <p class="text-foreground-muted text-sm">Usage</p>
      <div class="flex flex-wrap items-center gap-3">
        <Tooltip>
          <TooltipTrigger
            class={buttonVariants({ variant: 'outline', size: 'icon-md' })}
            aria-label="Add to favorites"
          >
            {@render heartIcon()}
          </TooltipTrigger>
          <TooltipContent>Add to favorites</TooltipContent>
        </Tooltip>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <p class="text-foreground-muted text-sm">Side & alignment</p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        {#each SIDES as side (side)}
          <Tooltip>
            <TooltipTrigger class={buttonVariants({ variant: 'outline' })}>{side}</TooltipTrigger>
            <TooltipContent {side}>Opens on the {side}</TooltipContent>
          </Tooltip>
        {/each}
      </div>
      <div class="flex flex-wrap items-center justify-center gap-3">
        {#each ALIGNS as align (align)}
          <Tooltip>
            <TooltipTrigger class={buttonVariants({ variant: 'outline' })}>{align}</TooltipTrigger>
            <TooltipContent side="bottom" {align}>Align {align}</TooltipContent>
          </Tooltip>
        {/each}
      </div>
    </div>
  </TooltipProvider>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Shared provider</p>
    <TooltipProvider delay={400}>
      <Toolbar aria-label="Text formatting">
        {#each ACTIONS as action, index (action.label)}
          {#if index === ACTIONS.length - 1}
            <ToolbarSeparator />
          {/if}
          <Tooltip>
            <TooltipTrigger
              class={buttonVariants({ variant: 'ghost', size: 'icon-md' })}
              aria-label={action.label}
            >
              {@render formatIcon(action.kind)}
            </TooltipTrigger>
            <TooltipContent>{action.label}</TooltipContent>
          </Tooltip>
        {/each}
      </Toolbar>
    </TooltipProvider>
  </div>

  <TooltipProvider>
    <div class="flex flex-col gap-3">
      <p class="text-foreground-muted text-sm">Rich content</p>
      <div class="flex flex-wrap items-center gap-3">
        <Tooltip>
          <TooltipTrigger class={buttonVariants({ variant: 'outline', size: 'icon-md' })} aria-label="Save">
            {@render bookmarkIcon()}
          </TooltipTrigger>
          <TooltipContent class="flex items-center gap-2">
            Save
            <Kbd size="sm">⌘ S</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <p class="text-foreground-muted text-sm">Follow the cursor</p>
      <Tooltip trackCursorAxis="x">
        <TooltipTrigger
          type="button"
          class="bg-background-subtle border-border-strong flex h-32 w-72 cursor-default items-center justify-center rounded-xl border border-dashed text-sm select-none"
        >
          Hover and move across
        </TooltipTrigger>
        <TooltipContent>Following the cursor</TooltipContent>
      </Tooltip>
    </div>

    <div class="flex flex-col gap-3">
      <p class="text-foreground-muted text-sm">Without an arrow</p>
      <div class="flex flex-wrap items-center gap-3">
        <Tooltip>
          <TooltipTrigger class={buttonVariants({ variant: 'outline' })}>No arrow</TooltipTrigger>
          <TooltipContent arrow={false}>Sits flush, without a pointer</TooltipContent>
        </Tooltip>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <p class="text-foreground-muted text-sm">Disabled</p>
      <div class="flex flex-wrap items-center gap-3">
        <Tooltip disabled>
          <TooltipTrigger class={buttonVariants({ variant: 'outline' })}>Disabled tooltip</TooltipTrigger>
          <TooltipContent>Will not open</TooltipContent>
        </Tooltip>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <p class="text-foreground-muted text-sm">Controlled</p>
      <label class="flex items-center gap-2 text-sm">
        <Switch checked={controlledOpen} onCheckedChange={(next) => (controlledOpen = next)} />
        Open
      </label>
      <div class="flex flex-wrap items-center gap-3">
        <Tooltip bind:open={controlledOpen}>
          <TooltipTrigger class={buttonVariants({ variant: 'outline' })}>Hover or toggle</TooltipTrigger>
          <TooltipContent>Controlled from the switch</TooltipContent>
        </Tooltip>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <p class="text-foreground-muted text-sm">RTL</p>
      <label class="flex items-center gap-2 text-sm">
        <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
        RTL
      </label>
      <DirectionProvider {dir}>
        <div {dir} class="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger class={buttonVariants({ variant: 'outline' })}>start</TooltipTrigger>
            <TooltipContent side="bottom" align="start">Align start</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger class={buttonVariants({ variant: 'outline' })}>end</TooltipTrigger>
            <TooltipContent side="bottom" align="end">Align end</TooltipContent>
          </Tooltip>
        </div>
      </DirectionProvider>
    </div>
  </TooltipProvider>
</section>
