<script lang="ts">
  import { Activity, ChartBar, LayoutGrid, List, Settings } from '@appica/icons-svelte'
  import {
    Badge,
    Button,
    DirectionProvider,
    Switch,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '@appica/ui-svelte'

  const STEPS = ['account', 'profile', 'review'] as const
  type Step = (typeof STEPS)[number]
  const SIZES = ['sm', 'md', 'lg'] as const

  let step: Step = $state('account')
  const index = $derived(STEPS.indexOf(step))
  let dir: 'ltr' | 'rtl' = $state('ltr')

  function goTo(target: number) {
    step = STEPS[Math.min(Math.max(target, 0), STEPS.length - 1)]!
  }
</script>

{#snippet layoutGridIcon(icon?: 'start')}
  <LayoutGrid data-icon={icon} />
{/snippet}

{#snippet activityIcon()}
  <Activity data-icon="start" />
{/snippet}

{#snippet settingsIcon()}
  <Settings data-icon="start" />
{/snippet}

{#snippet listIcon()}
  <List />
{/snippet}

{#snippet chartBarIcon()}
  <ChartBar />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Tabs</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <Tabs defaultValue="overview" class="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" class="text-foreground-muted text-sm">
        A snapshot of your workspace - recent files, members, and usage.
      </TabsContent>
      <TabsContent value="activity" class="text-foreground-muted text-sm">
        Every change, comment, and deploy across the team, newest first.
      </TabsContent>
      <TabsContent value="settings" class="text-foreground-muted text-sm">
        Manage the workspace name, visibility, and connected integrations.
      </TabsContent>
    </Tabs>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex w-full max-w-md flex-col gap-8">
      <Tabs defaultValue="overview" variant="pill">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs defaultValue="overview" variant="line">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex flex-col items-center gap-6">
      {#each SIZES as size (size)}
        <Tabs defaultValue="overview" {size}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </Tabs>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Vertical</p>
    <Tabs defaultValue="general" orientation="vertical" class="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="general" class="text-foreground-muted text-sm">
        Workspace name, URL slug, and default language.
      </TabsContent>
      <TabsContent value="members" class="text-foreground-muted text-sm">
        Invite teammates and manage their roles and permissions.
      </TabsContent>
      <TabsContent value="billing" class="text-foreground-muted text-sm">
        Your current plan, invoices, and payment method.
      </TabsContent>
    </Tabs>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With icons and badges</p>
    <Tabs defaultValue="overview" class="w-full max-w-md">
      <div class="scrollbar-none overflow-x-auto">
        <TabsList>
          <TabsTrigger value="overview">
            {@render layoutGridIcon('start')}
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity">
            {@render activityIcon()}
            Activity
            <Badge variant="outline" size="sm">12</Badge>
          </TabsTrigger>
          <TabsTrigger value="settings">
            {@render settingsIcon()}
            Settings
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="overview" class="text-foreground-muted text-sm">
        A snapshot of your workspace at a glance.
      </TabsContent>
      <TabsContent value="activity" class="text-foreground-muted text-sm">
        Every change across the team, newest first.
      </TabsContent>
      <TabsContent value="settings" class="text-foreground-muted text-sm">
        Workspace name, visibility, and integrations.
      </TabsContent>
    </Tabs>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Icon-only</p>
    <Tabs defaultValue="grid">
      <TabsList>
        <TabsTrigger value="grid" size="icon-md" aria-label="Grid view">
          {@render layoutGridIcon()}
        </TabsTrigger>
        <TabsTrigger value="list" size="icon-md" aria-label="List view">
          {@render listIcon()}
        </TabsTrigger>
        <TabsTrigger value="chart" size="icon-md" aria-label="Chart view">
          {@render chartBarIcon()}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <div class="flex w-full max-w-sm flex-col gap-5">
      <Tabs value={step} onValueChange={(value) => (step = value as Step)}>
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>
        <TabsContent value="account" class="text-foreground-muted text-sm">
          Step 1 - choose a username and password.
        </TabsContent>
        <TabsContent value="profile" class="text-foreground-muted text-sm">
          Step 2 - tell us a little about yourself.
        </TabsContent>
        <TabsContent value="review" class="text-foreground-muted text-sm">
          Step 3 - review everything and submit.
        </TabsContent>
      </Tabs>

      <div class="flex gap-2">
        <Button variant="outline" size="sm" disabled={index === 0} onclick={() => goTo(index - 1)}>Back</Button>
        <Button size="sm" disabled={index === STEPS.length - 1} onclick={() => goTo(index + 1)}>Next</Button>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled</p>
    <Tabs defaultValue="overview" class="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" class="text-foreground-muted text-sm">
        The billing tab is disabled until you upgrade to a paid plan.
      </TabsContent>
      <TabsContent value="activity" class="text-foreground-muted text-sm">
        Every change across the team, newest first.
      </TabsContent>
    </Tabs>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        <Tabs defaultValue="overview" class="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" class="text-foreground-muted text-sm">
            The tabs flow from the right and the active indicator follows direction.
          </TabsContent>
          <TabsContent value="activity" class="text-foreground-muted text-sm">
            Arrow keys swap roles in right-to-left layouts.
          </TabsContent>
          <TabsContent value="settings" class="text-foreground-muted text-sm">
            Workspace name, visibility, and integrations.
          </TabsContent>
        </Tabs>
      </div>
    </DirectionProvider>
  </div>
</section>
