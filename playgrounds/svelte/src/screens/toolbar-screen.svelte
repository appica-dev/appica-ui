<script lang="ts">
  import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ArrowBackUp,
    ArrowForwardUp,
    Bold,
    Copy,
    Download,
    Filter,
    Heading,
    Italic,
    Scissors,
    Underline,
  } from '@appica/icons-svelte'
  import {
    DirectionProvider,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    Toggle,
    ToggleGroup,
    Toolbar,
    ToolbarButton,
    ToolbarGroup,
    ToolbarInput,
    ToolbarLink,
    ToolbarSeparator,
    buttonVariants,
    inputVariants,
  } from '@appica/ui-svelte'

  let dir: 'ltr' | 'rtl' = $state('ltr')
  const iconClass = buttonVariants({ variant: 'ghost', size: 'icon-md' })
  const fonts = ['Geist', 'Inter', 'Figtree', 'Urbanist']
</script>

{#snippet filterIcon()}
  <Filter data-icon="start" />
{/snippet}
{#snippet downloadIcon()}
  <Download data-icon="start" />
{/snippet}
{#snippet undoIcon()}
  <ArrowBackUp />
{/snippet}
{#snippet redoIcon()}
  <ArrowForwardUp />
{/snippet}
{#snippet typeIcon()}
  <Heading data-icon="start" />
{/snippet}
{#snippet alignLeft()}
  <AlignLeft />
{/snippet}
{#snippet alignCenter()}
  <AlignCenter />
{/snippet}
{#snippet alignRight()}
  <AlignRight />
{/snippet}
{#snippet boldIcon()}
  <Bold />
{/snippet}
{#snippet italicIcon()}
  <Italic />
{/snippet}
{#snippet underlineIcon()}
  <Underline />
{/snippet}
{#snippet copyIcon()}
  <Copy />
{/snippet}
{#snippet scissorsIcon()}
  <Scissors />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Toolbar</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Default</p>
    <Toolbar aria-label="Table actions">
      <ToolbarInput
        class={inputVariants({ variant: 'outline', size: 'md', state: 'self' }) + ' w-44'}
        placeholder="Search tasks..."
        aria-label="Search tasks"
      />
      <ToolbarGroup aria-label="Refine">
        <ToolbarButton class={buttonVariants({ variant: 'ghost' })}>
          {@render filterIcon()}
          Filter
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarLink href="#export" class={buttonVariants({ variant: 'ghost' })}>
        {@render downloadIcon()}
        Export
      </ToolbarLink>
    </Toolbar>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With a toggle group</p>
    <Toolbar aria-label="Text formatting">
      <ToolbarGroup aria-label="History">
        <ToolbarButton class={iconClass} aria-label="Undo">{@render undoIcon()}</ToolbarButton>
        <ToolbarButton class={iconClass} aria-label="Redo">{@render redoIcon()}</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <Select defaultValue="Inter" alignItemWithTrigger={false}>
        <SelectTrigger class="w-36" aria-label="Font">
          {#snippet start()}
            {@render typeIcon()}
          {/snippet}
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {#each fonts as font (font)}
            <SelectItem value={font} label={font}>{font}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
      <ToolbarSeparator />
      <ToggleGroup defaultValue="left" aria-label="Alignment">
        <Toggle value="left" aria-label="Align left" class={iconClass}>{@render alignLeft()}</Toggle>
        <Toggle value="center" aria-label="Align center" class={iconClass}>{@render alignCenter()}</Toggle>
        <Toggle value="right" aria-label="Align right" class={iconClass}>{@render alignRight()}</Toggle>
      </ToggleGroup>
    </Toolbar>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Vertical orientation</p>
    <Toolbar aria-label="Formatting" orientation="vertical">
      <ToolbarGroup aria-label="Text style">
        <ToolbarButton class={iconClass} aria-label="Bold">{@render boldIcon()}</ToolbarButton>
        <ToolbarButton class={iconClass} aria-label="Italic">{@render italicIcon()}</ToolbarButton>
        <ToolbarButton class={iconClass} aria-label="Underline">{@render underlineIcon()}</ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Clipboard">
        <ToolbarButton class={iconClass} aria-label="Copy">{@render copyIcon()}</ToolbarButton>
        <ToolbarButton class={iconClass} aria-label="Cut">{@render scissorsIcon()}</ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        <Toolbar aria-label="RTL toolbar">
          <ToolbarButton class={buttonVariants({ variant: 'ghost' })}>Filter</ToolbarButton>
          <ToolbarSeparator />
          <ToolbarButton class={buttonVariants({ variant: 'ghost' })}>Export</ToolbarButton>
        </Toolbar>
      </div>
    </DirectionProvider>
  </div>
</section>
