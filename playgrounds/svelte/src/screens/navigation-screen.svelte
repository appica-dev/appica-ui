<script lang="ts">
  import { Folder, LayoutDashboard, Settings, Users } from '@appica/icons-svelte'
  import {
    Badge,
    DirectionProvider,
    Navigation,
    NavigationItem,
    NavigationLink,
    NavigationList,
    Switch,
  } from '@appica/ui-svelte'

  const SIZES = ['sm', 'md', 'lg'] as const
  const BASIC = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'projects', label: 'Projects' },
    { value: 'team', label: 'Team' },
    { value: 'settings', label: 'Settings' },
  ] as const
  const VARIANT_ITEMS = [
    { value: 'overview', label: 'Overview' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'reports', label: 'Reports' },
    { value: 'notifications', label: 'Notifications' },
  ] as const
  const SIZE_ITEMS = [
    { value: 'home', label: 'Home' },
    { value: 'docs', label: 'Docs' },
    { value: 'pricing', label: 'Pricing' },
  ] as const
  const SIDEBAR = [
    { value: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { value: 'projects', label: 'Projects', icon: 'folder' },
    { value: 'team', label: 'Team', icon: 'users' },
    { value: 'settings', label: 'Settings', icon: 'settings' },
  ] as const
  const INDICATOR_ITEMS = [
    { value: 'getting-started', label: 'Getting started' },
    { value: 'installation', label: 'Installation' },
    { value: 'theming', label: 'Theming' },
    { value: 'components', label: 'Components' },
  ] as const
  const CONTROLLED_ITEMS = [
    { value: 'account', label: 'Account' },
    { value: 'security', label: 'Security' },
    { value: 'billing', label: 'Billing' },
    { value: 'team', label: 'Team' },
  ] as const

  let controlled = $state('account')
  let dir: 'ltr' | 'rtl' = $state('ltr')

  function stay(event: MouseEvent) {
    event.preventDefault()
  }
</script>

{#snippet dashboardIcon()}
  <LayoutDashboard data-icon="start" />
{/snippet}

{#snippet folderIcon()}
  <Folder data-icon="start" />
{/snippet}

{#snippet usersIcon()}
  <Users data-icon="start" />
{/snippet}

{#snippet settingsIcon()}
  <Settings data-icon="start" />
{/snippet}

{#snippet startIcon(name: string)}
  {#if name === 'dashboard'}
    {@render dashboardIcon()}
  {:else if name === 'folder'}
    {@render folderIcon()}
  {:else if name === 'users'}
    {@render usersIcon()}
  {:else}
    {@render settingsIcon()}
  {/if}
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Navigation</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Basic</p>
    <Navigation aria-label="Main" activeLink="dashboard" class="max-w-full">
      <NavigationList class="scrollbar-none overflow-x-auto">
        {#each BASIC as item (item.value)}
          <NavigationItem>
            <NavigationLink href="#!" value={item.value} onclick={stay}>{item.label}</NavigationLink>
          </NavigationItem>
        {/each}
      </NavigationList>
    </Navigation>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex w-full max-w-full flex-col items-center gap-8">
      <Navigation aria-label="Pill" variant="pill" activeLink="overview" class="max-w-full">
        <NavigationList class="scrollbar-none overflow-x-auto">
          {#each VARIANT_ITEMS as item (item.value)}
            <NavigationItem>
              <NavigationLink href="#!" value={item.value} onclick={stay}>{item.label}</NavigationLink>
            </NavigationItem>
          {/each}
        </NavigationList>
      </Navigation>
      <Navigation aria-label="Line" variant="line" activeLink="overview" class="max-w-full">
        <NavigationList class="scrollbar-none overflow-x-auto">
          {#each VARIANT_ITEMS as item (item.value)}
            <NavigationItem>
              <NavigationLink href="#!" value={item.value} onclick={stay}>{item.label}</NavigationLink>
            </NavigationItem>
          {/each}
        </NavigationList>
      </Navigation>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex flex-col gap-6">
      {#each SIZES as size (size)}
        <Navigation aria-label={size} {size} activeLink="home">
          <NavigationList>
            {#each SIZE_ITEMS as item (item.value)}
              <NavigationItem>
                <NavigationLink href="#!" value={item.value} onclick={stay}>{item.label}</NavigationLink>
              </NavigationItem>
            {/each}
          </NavigationList>
        </Navigation>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With icons and badges</p>
    <Navigation aria-label="Main" activeLink="dashboard" class="max-w-full">
      <NavigationList class="scrollbar-none overflow-x-auto">
        <NavigationItem>
          <NavigationLink href="#!" value="dashboard" onclick={stay}>
            {@render dashboardIcon()}
            Dashboard
          </NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink href="#!" value="projects" onclick={stay}>
            {@render folderIcon()}
            Projects
          </NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink href="#!" value="team" onclick={stay}>
            {@render usersIcon()}
            Team
            <Badge variant="outline" size="sm" data-icon="end">4</Badge>
          </NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink href="#!" value="settings" onclick={stay}>
            {@render settingsIcon()}
            Settings
          </NavigationLink>
        </NavigationItem>
      </NavigationList>
    </Navigation>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Vertical sidebar</p>
    <Navigation aria-label="Sidebar" orientation="vertical" variant="pill" activeLink="projects" class="w-48">
      <NavigationList>
        {#each SIDEBAR as item (item.value)}
          <NavigationItem>
            <NavigationLink href="#!" value={item.value} class="w-full" onclick={stay}>
              {@render startIcon(item.icon)}
              {item.label}
            </NavigationLink>
          </NavigationItem>
        {/each}
      </NavigationList>
    </Navigation>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Indicator</p>
    <Navigation aria-label="Docs" orientation="vertical" variant="indicator" activeLink="theming" class="w-56">
      <NavigationList>
        {#each INDICATOR_ITEMS as item (item.value)}
          <NavigationItem>
            <NavigationLink href="#!" value={item.value} onclick={stay}>{item.label}</NavigationLink>
          </NavigationItem>
        {/each}
      </NavigationList>
    </Navigation>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <Navigation aria-label="Settings" variant="line" activeLink={controlled} class="max-w-full">
      <NavigationList class="scrollbar-none overflow-x-auto">
        {#each CONTROLLED_ITEMS as item (item.value)}
          <NavigationItem>
            <NavigationLink value={item.value} el="button" onclick={() => (controlled = item.value)}>
              {item.label}
            </NavigationLink>
          </NavigationItem>
        {/each}
      </NavigationList>
    </Navigation>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Links</p>
    <Navigation aria-label="Main" activeLink="overview">
      <NavigationList>
        <NavigationItem>
          <NavigationLink href="#!" value="overview" onclick={stay}>Overview</NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink href="#!" value="changelog" onclick={stay}>Changelog</NavigationLink>
        </NavigationItem>
        <NavigationItem>
          <NavigationLink href="#!" value="roadmap" disabled>Roadmap</NavigationLink>
        </NavigationItem>
      </NavigationList>
    </Navigation>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="flex w-full max-w-full flex-col gap-8">
        <Navigation aria-label="Line" variant="line" activeLink="overview" class="max-w-full">
          <NavigationList class="scrollbar-none overflow-x-auto">
            {#each VARIANT_ITEMS as item (item.value)}
              <NavigationItem>
                <NavigationLink href="#!" value={item.value} onclick={stay}>{item.label}</NavigationLink>
              </NavigationItem>
            {/each}
          </NavigationList>
        </Navigation>
        <Navigation aria-label="Docs" orientation="vertical" variant="indicator" activeLink="theming" class="w-56">
          <NavigationList>
            {#each INDICATOR_ITEMS as item (item.value)}
              <NavigationItem>
                <NavigationLink href="#!" value={item.value} onclick={stay}>{item.label}</NavigationLink>
              </NavigationItem>
            {/each}
          </NavigationList>
        </Navigation>
      </div>
    </DirectionProvider>
  </div>
</section>
