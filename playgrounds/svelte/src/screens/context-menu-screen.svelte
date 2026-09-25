<script lang="ts">
  import {
    Clipboard,
    Copy,
    Download,
    Folder,
    Link,
    Pencil,
    Photo,
    Scissors,
    Star,
    Trash,
  } from '@appica/icons-svelte'
  import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuGroupLabel,
    ContextMenuItem,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
    DirectionProvider,
    Kbd,
    Switch,
  } from '@appica/ui-svelte'

  let showGrid = $state(true)
  let showRulers = $state(false)
  let zoom = $state('fit')
  let dir: 'ltr' | 'rtl' = $state('ltr')
  const SIZES = ['sm', 'md', 'lg'] as const
</script>

{#snippet copyIcon()}
  <Copy data-icon="start" />
{/snippet}

{#snippet scissorsIcon()}
  <Scissors data-icon="start" />
{/snippet}

{#snippet clipboardIcon()}
  <Clipboard data-icon="start" />
{/snippet}

{#snippet trashIcon()}
  <Trash data-icon="start" />
{/snippet}

{#snippet photoIcon()}
  <Photo class="size-8" />
{/snippet}

{#snippet downloadIcon()}
  <Download data-icon="start" />
{/snippet}

{#snippet pencilIcon()}
  <Pencil data-icon="start" />
{/snippet}

{#snippet linkIcon()}
  <Link data-icon="start" />
{/snippet}

{#snippet folderIcon()}
  <Folder data-icon="start" />
{/snippet}

{#snippet starIcon()}
  <Star data-icon="start" />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Context menu</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Basic</p>
    <ContextMenu>
      <ContextMenuTrigger
        class="bg-background-subtle border-border-strong flex h-40 w-72 items-center justify-center rounded-xl border border-dashed text-sm select-none"
      >
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          {@render copyIcon()}
          Copy
          <Kbd size="sm" class="ms-auto">⌘C</Kbd>
        </ContextMenuItem>
        <ContextMenuItem>
          {@render scissorsIcon()}
          Cut
          <Kbd size="sm" class="ms-auto">⌘X</Kbd>
        </ContextMenuItem>
        <ContextMenuItem>
          {@render clipboardIcon()}
          Paste
          <Kbd size="sm" class="ms-auto">⌘V</Kbd>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem class="text-error-emphasis! data-highlighted:before:bg-error-subtle!">
          {@render trashIcon()}
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">On a card</p>
    <ContextMenu>
      <ContextMenuTrigger class="block w-56 cursor-default text-left select-none">
        <div class="bg-background-muted text-foreground-subtle flex aspect-video items-center justify-center rounded-xl">
          {@render photoIcon()}
        </div>
        <p class="text-foreground-intense mt-2 text-sm font-medium">cover-art.png</p>
        <p class="text-foreground-muted text-xs">1.2 MB · PNG</p>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          {@render downloadIcon()}
          Download
        </ContextMenuItem>
        <ContextMenuItem>
          {@render pencilIcon()}
          Rename
        </ContextMenuItem>
        <ContextMenuItem>
          {@render linkIcon()}
          Copy link
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            {@render folderIcon()}
            Move to
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Projects</ContextMenuItem>
            <ContextMenuItem>Archive</ContextMenuItem>
            <ContextMenuItem>Trash</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>
          {@render starIcon()}
          Add to favorites
        </ContextMenuItem>
        <ContextMenuItem class="text-error-emphasis! data-highlighted:before:bg-error-subtle!">
          {@render trashIcon()}
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Checkbox & radio items</p>
    <ContextMenu>
      <ContextMenuTrigger
        class="bg-background-subtle border-border-strong flex h-40 w-72 items-center justify-center rounded-xl border border-dashed text-sm select-none"
      >
        Right-click the canvas
      </ContextMenuTrigger>
      <ContextMenuContent class="w-50">
        <ContextMenuGroup>
          <ContextMenuGroupLabel>View</ContextMenuGroupLabel>
          <ContextMenuCheckboxItem bind:checked={showGrid}>Show grid</ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem bind:checked={showRulers}>Show rulers</ContextMenuCheckboxItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup bind:value={zoom}>
          <ContextMenuGroupLabel>Zoom</ContextMenuGroupLabel>
          <ContextMenuRadioItem value="fit">Fit to screen</ContextMenuRadioItem>
          <ContextMenuRadioItem value="100">100%</ContextMenuRadioItem>
          <ContextMenuRadioItem value="200">200%</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      {#each SIZES as size (size)}
        <ContextMenu {size}>
          <ContextMenuTrigger
            class="bg-background-subtle border-border-strong flex h-24 w-32 items-center justify-center rounded-xl border border-dashed text-sm select-none"
          >
            {size}
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Delete</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        <ContextMenu>
          <ContextMenuTrigger
            class="bg-background-subtle border-border-strong flex h-40 w-72 items-center justify-center rounded-xl border border-dashed text-sm select-none"
          >
            Right-click here
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>
              {@render copyIcon()}
              Copy
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                {@render folderIcon()}
                Move to
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem>Projects</ContextMenuItem>
                <ContextMenuItem>Archive</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem class="text-error-emphasis! data-highlighted:before:bg-error-subtle!">
              {@render trashIcon()}
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </DirectionProvider>
  </div>
</section>
