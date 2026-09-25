<script lang="ts">
  import {
    ArrowUpRight,
    Bell,
    Book,
    ChevronDown,
    Copy,
    CreditCard,
    GitBranch,
    Heart,
    IdBadge,
    LayoutColumns,
    LayoutDashboard,
    Link,
    Logout,
    Mail,
    MapPin,
    Message,
    MessageCircle,
    Moon,
    Pencil,
    Settings,
    ShoppingBag,
    Trash,
    User,
    UserCircle,
    UserPlus,
  } from '@appica/icons-svelte'
  import {
    Avatar,
    AvatarFallback,
    Badge,
    DirectionProvider,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuGroupLabel,
    DropdownMenuItem,
    DropdownMenuLinkItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    Kbd,
    ScrollArea,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    buttonVariants,
  } from '@appica/ui-svelte'

  const WORKSPACES = [
    'Acme Corp',
    'Globex',
    'Initech',
    'Umbrella',
    'Stark Industries',
    'Wayne Enterprises',
    'Soylent',
    'Hooli',
    'Pied Piper',
    'Wonka Industries',
    'Cyberdyne',
    'Aperture Science',
  ]

  type ColumnKey = 'email' | 'role' | 'status'

  const COLUMNS: { key: ColumnKey; label: string }[] = [
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ]

  const ROWS: { name: string; email: string; role: string; status: string }[] = [
    { name: 'Sarah Jenkins', email: 'sarah@appica.dev', role: 'Admin', status: 'Active' },
    { name: 'Liam Hudson', email: 'liam@appica.dev', role: 'Editor', status: 'Invited' },
    { name: 'Mateo Rossi', email: 'mateo@appica.dev', role: 'Viewer', status: 'Active' },
  ]

  const SIZES = ['sm', 'md', 'lg'] as const

  const PLACEMENTS = [
    { side: 'top', align: 'start' },
    { side: 'right', align: 'center' },
    { side: 'bottom', align: 'end' },
    { side: 'left', align: 'center' },
  ] as const

  const CHEVRON_CLASS =
    'transition-transform duration-200 ease-out group-data-popup-open/trigger:rotate-180 motion-reduce:transition-none'

  let darkMode = $state(false)
  let visible = $state<Record<ColumnKey, boolean>>({
    email: true,
    role: true,
    status: false,
  })
  let sortBy = $state('recent')
  let dir: 'ltr' | 'rtl' = $state('ltr')

  const shown = $derived(COLUMNS.filter((column) => visible[column.key]))
</script>

{#snippet userCircle()}
  <UserCircle data-icon="start" />
{/snippet}

{#snippet shoppingBag()}
  <ShoppingBag data-icon="start" />
{/snippet}

{#snippet heart()}
  <Heart data-icon="start" />
{/snippet}

{#snippet message()}
  <Message data-icon="start" />
{/snippet}

{#snippet layoutDashboard()}
  <LayoutDashboard data-icon="start" />
{/snippet}

{#snippet settings()}
  <Settings data-icon="start" />
{/snippet}

{#snippet bell()}
  <Bell data-icon="start" />
{/snippet}

{#snippet moon()}
  <Moon data-icon="start" />
{/snippet}

{#snippet logout()}
  <Logout data-icon="start" />
{/snippet}

{#snippet idBadge()}
  <IdBadge data-icon="start" />
{/snippet}

{#snippet creditCard()}
  <CreditCard data-icon="start" />
{/snippet}

{#snippet mapPin()}
  <MapPin data-icon="start" />
{/snippet}

{#snippet chevronDown()}
  <ChevronDown data-icon="end" class={CHEVRON_CLASS} />
{/snippet}

{#snippet user()}
  <User data-icon="start" />
{/snippet}

{#snippet copy()}
  <Copy data-icon="start" />
{/snippet}

{#snippet pencil()}
  <Pencil data-icon="start" />
{/snippet}

{#snippet trash()}
  <Trash data-icon="start" />
{/snippet}

{#snippet layoutColumns()}
  <LayoutColumns data-icon="start" />
{/snippet}

{#snippet userPlus()}
  <UserPlus data-icon="start" />
{/snippet}

{#snippet mail()}
  <Mail data-icon="start" />
{/snippet}

{#snippet messageCircle()}
  <MessageCircle data-icon="start" />
{/snippet}

{#snippet link()}
  <Link data-icon="start" />
{/snippet}

{#snippet book()}
  <Book data-icon="start" />
{/snippet}

{#snippet gitBranch()}
  <GitBranch data-icon="start" />
{/snippet}

{#snippet arrowUpRight()}
  <ArrowUpRight data-icon="end" class="ms-auto" />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Dropdown menu</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Usage</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger class={buttonVariants({ variant: 'outline' })}>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>My Account</DropdownMenuGroupLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Account menu</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger class={buttonVariants()}>
          {@render userCircle()}
          My account
        </DropdownMenuTrigger>
        <DropdownMenuContent class="min-w-64">
          <div class="flex gap-3 px-2.5 pt-2.5 pb-1.5">
            <Avatar size="sm">
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1">
              <p class="text-foreground-intense truncate text-sm font-semibold">Sarah Jenkins</p>
              <p class="text-foreground-muted truncate text-xs">sarah@appica.dev</p>
            </div>
            <Badge variant="secondary" size="sm">User</Badge>
          </div>

          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Personal</DropdownMenuGroupLabel>
            <DropdownMenuItem>
              {@render userCircle()}
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              {@render shoppingBag()}
              My Orders
              <Badge variant="outline" size="sm" class="ms-auto">2</Badge>
            </DropdownMenuItem>
            <DropdownMenuItem>
              {@render heart()}
              Wishlist
            </DropdownMenuItem>
            <DropdownMenuItem>
              {@render message()}
              Messages
              <Badge variant="outline" size="sm" class="ms-auto">5</Badge>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Management</DropdownMenuGroupLabel>
            <DropdownMenuItem>
              {@render layoutDashboard()}
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {@render settings()}
                Settings
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  {@render idBadge()}
                  Personal Info
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {@render creditCard()}
                  Payments
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {@render mapPin()}
                  Addresses
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem>
              {@render bell()}
              Notifications
            </DropdownMenuItem>
            <DropdownMenuItem closeOnClick={false} onclick={() => (darkMode = !darkMode)}>
              {@render moon()}
              Dark Mode
              <Switch checked={darkMode} tabindex={-1} aria-hidden="true" class="pointer-events-none ms-auto" />
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            {@render logout()}
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Icons, shortcuts and animated chevron</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger class={['group/trigger', buttonVariants({ variant: 'outline' })]}>
          Actions
          {@render chevronDown()}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            {@render user()}
            Profile
            <Kbd size="sm" class="ms-auto">⇧⌘P</Kbd>
          </DropdownMenuItem>
          <DropdownMenuItem>
            {@render copy()}
            Duplicate
            <Kbd size="sm" class="ms-auto">⌘D</Kbd>
          </DropdownMenuItem>
          <DropdownMenuItem>
            {@render pencil()}
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-error-emphasis! data-highlighted:before:bg-error-subtle!">
            {@render trash()}
            Delete
            <Kbd size="sm" class="ms-auto">⌫</Kbd>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Groups and labels</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger class={buttonVariants({ variant: 'outline' })}>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Account</DropdownMenuGroupLabel>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Team</DropdownMenuGroupLabel>
            <DropdownMenuItem>Invite members</DropdownMenuItem>
            <DropdownMenuItem>New workspace</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Scrollable</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger class={['group/trigger', buttonVariants({ variant: 'outline' })]}>
          Switch workspace
          {@render chevronDown()}
        </DropdownMenuTrigger>
        <DropdownMenuContent class="min-w-60">
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Workspaces</DropdownMenuGroupLabel>
            <ScrollArea class="-mx-2 max-h-64" scrollbarVisibility="always" viewportProps={{ class: 'px-2' }}>
              <div class="flex flex-col gap-0.5">
                {#each WORKSPACES as name (name)}
                  <DropdownMenuItem>
                    <Avatar size="sm" data-icon="start">
                      <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    {name}
                  </DropdownMenuItem>
                {/each}
              </div>
            </ScrollArea>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Checkbox items (controlled)</p>
    <div class="flex w-full max-w-125 flex-col gap-3">
      <div class="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger class={['group/trigger', buttonVariants({ variant: 'outline' })]}>
            {@render layoutColumns()}
            Columns
            {@render chevronDown()}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuGroupLabel>Toggle columns</DropdownMenuGroupLabel>
              {#each COLUMNS as column (column.key)}
                <DropdownMenuCheckboxItem
                  checked={visible[column.key]}
                  onCheckedChange={(checked) => (visible = { ...visible, [column.key]: checked })}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              {/each}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ScrollArea
        orientation="horizontal"
        scrollbarVisibility="auto"
        class="[&_td]:whitespace-nowrap [&_th]:whitespace-nowrap"
      >
        <Table hoverableRows>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {#each shown as column (column.key)}
                <TableHead>{column.label}</TableHead>
              {/each}
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each ROWS as row (row.email)}
              <TableRow>
                <TableCell class="text-foreground-intense font-medium">{row.name}</TableCell>
                {#each shown as column (column.key)}
                  <TableCell>{row[column.key]}</TableCell>
                {/each}
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Radio items</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger class={buttonVariants({ variant: 'outline' })}>Sort by</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup bind:value={sortBy}>
            <DropdownMenuGroupLabel>Sort order</DropdownMenuGroupLabel>
            <DropdownMenuRadioItem value="recent">Most recent</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="popular">Most popular</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Submenus</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger class={buttonVariants({ variant: 'outline' })}>Share</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuItem>Embed</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {@render userPlus()}
              Invite people
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>
                {@render mail()}
                Email
              </DropdownMenuItem>
              <DropdownMenuItem>
                {@render messageCircle()}
                Message
              </DropdownMenuItem>
              <DropdownMenuItem>
                {@render link()}
                Invite link
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Open on hover</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger class={['group/trigger', buttonVariants({ variant: 'outline' })]} openOnHover delay={100}>
          Hover me
          {@render chevronDown()}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            {@render user()}
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            {@render settings()}
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            {@render logout()}
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Link items</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger class={buttonVariants({ variant: 'outline' })}>Go to</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLinkItem href="#dashboard">
            {@render layoutDashboard()}
            Dashboard
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem href="#settings">
            {@render settings()}
            Settings
          </DropdownMenuLinkItem>
          <DropdownMenuSeparator />
          <DropdownMenuLinkItem href="https://base-ui.com" target="_blank" rel="noreferrer">
            {@render book()}
            Documentation
            {@render arrowUpRight()}
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem href="https://github.com" target="_blank" rel="noreferrer">
            {@render gitBranch()}
            Source code
            {@render arrowUpRight()}
          </DropdownMenuLinkItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      {#each SIZES as size (size)}
        <DropdownMenu {size}>
          <DropdownMenuTrigger class={buttonVariants({ variant: 'outline', size })}>{size}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Side and alignment</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      {#each PLACEMENTS as { side, align } (`${side}-${align}`)}
        <DropdownMenu>
          <DropdownMenuTrigger class={buttonVariants({ variant: 'outline' })}>{side} / {align}</DropdownMenuTrigger>
          <DropdownMenuContent {side} {align}>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="flex flex-wrap items-center justify-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger class={buttonVariants({ variant: 'outline' })}>Account</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              {@render user()}
              Profile
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {@render settings()}
                Settings
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Personal Info</DropdownMenuItem>
                <DropdownMenuItem>Payments</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {@render logout()}
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DirectionProvider>
  </div>
</section>
