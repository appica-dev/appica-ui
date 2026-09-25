<script lang="ts">
  import {
    ArrowBackUp,
    ArrowForwardUp,
    Clipboard,
    Copy,
    Download,
    Eye,
    FilePlus,
    FileText,
    Folder,
    FolderOpen,
    LayoutGrid,
    Maximize,
    Pencil,
    Scissors,
    Settings,
    Users,
    ZoomIn,
    ZoomOut,
  } from '@appica/icons-svelte'
  import {
    DirectionProvider,
    Kbd,
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarGroup,
    MenubarGroupLabel,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
    Switch,
  } from '@appica/ui-svelte'

  const MENUS = ['File', 'Edit', 'View'] as const
  const SIZES = ['sm', 'md', 'lg'] as const

  let dir: 'ltr' | 'rtl' = $state('ltr')
  let toolbar = $state(true)
  let sidebar = $state(false)
  let theme = $state('system')

  type IconName =
    | 'layout'
    | 'folder'
    | 'users'
    | 'settings'
    | 'file-text'
    | 'pencil'
    | 'eye'
    | 'file-plus'
    | 'folder-open'
    | 'download'
    | 'undo'
    | 'redo'
    | 'scissors'
    | 'copy'
    | 'clipboard'
    | 'zoom-in'
    | 'zoom-out'
    | 'maximize'
</script>

{#snippet icon(name: IconName)}
  {#if name === 'layout'}
    <LayoutGrid data-icon="start" />
  {:else if name === 'folder'}
    <Folder data-icon="start" />
  {:else if name === 'users'}
    <Users data-icon="start" />
  {:else if name === 'settings'}
    <Settings data-icon="start" />
  {:else if name === 'file-text'}
    <FileText data-icon="start" />
  {:else if name === 'pencil'}
    <Pencil data-icon="start" />
  {:else if name === 'eye'}
    <Eye data-icon="start" />
  {:else if name === 'file-plus'}
    <FilePlus data-icon="start" />
  {:else if name === 'folder-open'}
    <FolderOpen data-icon="start" />
  {:else if name === 'download'}
    <Download data-icon="start" />
  {:else if name === 'undo'}
    <ArrowBackUp data-icon="start" />
  {:else if name === 'redo'}
    <ArrowForwardUp data-icon="start" />
  {:else if name === 'scissors'}
    <Scissors data-icon="start" />
  {:else if name === 'copy'}
    <Copy data-icon="start" />
  {:else if name === 'clipboard'}
    <Clipboard data-icon="start" />
  {:else if name === 'zoom-in'}
    <ZoomIn data-icon="start" />
  {:else if name === 'zoom-out'}
    <ZoomOut data-icon="start" />
  {:else if name === 'maximize'}
    <Maximize data-icon="start" />
  {/if}
{/snippet}

{#snippet shortcut(keys: string)}
  <Kbd size="sm" class="ms-auto">{keys}</Kbd>
{/snippet}

{#snippet simpleMenus()}
  {#each MENUS as label (label)}
    <MenubarMenu>
      <MenubarTrigger>{label}</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Action one</MenubarItem>
        <MenubarItem>Action two</MenubarItem>
        <MenubarItem>Action three</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  {/each}
{/snippet}

{#snippet applicationMenus()}
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        New file
        {@render shortcut('⌘N')}
      </MenubarItem>
      <MenubarItem>
        Open…
        {@render shortcut('⌘O')}
      </MenubarItem>
      <MenubarSub>
        <MenubarSubTrigger>Open recent</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem>project-alpha</MenubarItem>
          <MenubarItem>landing-page</MenubarItem>
          <MenubarItem>design-system</MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
      <MenubarSeparator />
      <MenubarItem>
        Save
        {@render shortcut('⌘S')}
      </MenubarItem>
      <MenubarItem>
        Save as…
        {@render shortcut('⇧⌘S')}
      </MenubarItem>
    </MenubarContent>
  </MenubarMenu>

  <MenubarMenu>
    <MenubarTrigger>Edit</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        Undo
        {@render shortcut('⌘Z')}
      </MenubarItem>
      <MenubarItem>
        Redo
        {@render shortcut('⇧⌘Z')}
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem>Cut</MenubarItem>
      <MenubarItem>Copy</MenubarItem>
      <MenubarItem>Paste</MenubarItem>
    </MenubarContent>
  </MenubarMenu>

  <MenubarMenu>
    <MenubarTrigger>View</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>Zoom in</MenubarItem>
      <MenubarItem>Zoom out</MenubarItem>
      <MenubarItem>Reset zoom</MenubarItem>
      <MenubarSeparator />
      <MenubarItem disabled>Enter full screen</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Menubar</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Application menu</p>
    <Menubar aria-label="Application">
      {@render applicationMenus()}
    </Menubar>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex flex-col items-center gap-8">
      <Menubar variant="pill" aria-label="Pill menubar">
        {@render simpleMenus()}
      </Menubar>
      <Menubar variant="line" aria-label="Line menubar">
        {@render simpleMenus()}
      </Menubar>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex flex-col items-center gap-6">
      {#each SIZES as size (size)}
        <Menubar {size} aria-label="{size} menubar">
          {@render simpleMenus()}
        </Menubar>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Vertical</p>
    <Menubar orientation="vertical" aria-label="Workspace" class="w-35">
      <MenubarMenu>
        <MenubarTrigger>
          {@render icon('layout')}
          Overview
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Summary</MenubarItem>
          <MenubarItem>Activity</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>
          {@render icon('folder')}
          Projects
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>All projects</MenubarItem>
          <MenubarItem>New project</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Archived</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>
          {@render icon('users')}
          Team
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Members</MenubarItem>
          <MenubarItem>Invitations</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>
          {@render icon('settings')}
          Settings
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>General</MenubarItem>
          <MenubarItem>Billing</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Submenus</p>
    <Menubar aria-label="Application">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New file
            {@render shortcut('⌘N')}
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Open recent</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>project-alpha</MenubarItem>
              <MenubarItem>landing-page</MenubarItem>
              <MenubarItem>design-system</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Clear recent</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Save
            {@render shortcut('⌘S')}
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Share</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Copy link</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Export as</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF</MenubarItem>
              <MenubarItem>PNG</MenubarItem>
              <MenubarItem>SVG</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Checkbox and radio items</p>
    <Menubar aria-label="Editor">
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarGroupLabel>Panels</MenubarGroupLabel>
            <MenubarCheckboxItem bind:checked={toolbar}>Toolbar</MenubarCheckboxItem>
            <MenubarCheckboxItem bind:checked={sidebar}>Sidebar</MenubarCheckboxItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarRadioGroup bind:value={theme}>
            <MenubarGroupLabel>Theme</MenubarGroupLabel>
            <MenubarRadioItem value="light">Light</MenubarRadioItem>
            <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
            <MenubarRadioItem value="system">System</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Documentation</MenubarItem>
          <MenubarItem>Keyboard shortcuts</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Leading icons</p>
    <Menubar aria-label="Application">
      <MenubarMenu>
        <MenubarTrigger>
          {@render icon('file-text')}
          File
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            {@render icon('file-plus')}
            New file
            {@render shortcut('⌘N')}
          </MenubarItem>
          <MenubarItem>
            {@render icon('folder-open')}
            Open…
            {@render shortcut('⌘O')}
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            {@render icon('download')}
            Save
            {@render shortcut('⌘S')}
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>
          {@render icon('pencil')}
          Edit
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            {@render icon('undo')}
            Undo
          </MenubarItem>
          <MenubarItem>
            {@render icon('redo')}
            Redo
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            {@render icon('scissors')}
            Cut
          </MenubarItem>
          <MenubarItem>
            {@render icon('copy')}
            Copy
          </MenubarItem>
          <MenubarItem>
            {@render icon('clipboard')}
            Paste
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>
          {@render icon('eye')}
          View
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            {@render icon('zoom-in')}
            Zoom in
          </MenubarItem>
          <MenubarItem>
            {@render icon('zoom-out')}
            Zoom out
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            {@render icon('maximize')}
            Enter full screen
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        <Menubar aria-label="Application">
          {@render applicationMenus()}
        </Menubar>
      </div>
    </DirectionProvider>
  </div>
</section>
