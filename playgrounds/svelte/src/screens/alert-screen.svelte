<script lang="ts">
  import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Button,
    DirectionProvider,
    Switch,
  } from '@appica/ui-svelte'

  const PERSIST_KEY = 'playground-alert'
  const VARIANTS = [
    { variant: 'default', icon: 'bell', title: 'Update available', desc: 'Version 2.4 is ready to install.' },
    { variant: 'primary', icon: 'sparkle', title: 'New feature', desc: 'You can now schedule reports to run weekly.' },
    { variant: 'secondary', icon: 'info', title: 'Did you know?', desc: 'Press ⌘K to search from anywhere.' },
    { variant: 'info', icon: 'info', title: 'Maintenance window', desc: 'We will be offline Sunday 02:00-03:00 UTC.' },
    { variant: 'success', icon: 'check', title: 'Payment received', desc: 'Your invoice has been settled.' },
    { variant: 'warning', icon: 'warning', title: 'Storage almost full', desc: 'You have used 92% of your quota.' },
    { variant: 'error', icon: 'error', title: 'Payment failed', desc: 'We could not charge your card on file.' },
  ] as const

  let controlledOpen = $state(true)
  let persistNonce = $state(0)
  let dir: 'ltr' | 'rtl' = $state('ltr')

  function resetPersist() {
    localStorage.removeItem(PERSIST_KEY)
    persistNonce += 1
  }
</script>

{#snippet bellIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
  </svg>
{/snippet}

{#snippet sparkleIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"></path>
    <path d="m19 15 .7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"></path>
  </svg>
{/snippet}

{#snippet infoIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
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
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
{/snippet}

{#snippet warningIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
    <path d="M12 9v4"></path>
    <path d="M12 17h.01"></path>
  </svg>
{/snippet}

{#snippet errorIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m15 9-6 6"></path>
    <path d="m9 9 6 6"></path>
  </svg>
{/snippet}

{#snippet variantIcon(name: (typeof VARIANTS)[number]['icon'])}
  {#if name === 'bell'}
    {@render bellIcon()}
  {:else if name === 'sparkle'}
    {@render sparkleIcon()}
  {:else if name === 'info'}
    {@render infoIcon()}
  {:else if name === 'check'}
    {@render checkIcon()}
  {:else if name === 'warning'}
    {@render warningIcon()}
  {:else}
    {@render errorIcon()}
  {/if}
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Alert</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Default</p>
    <div class="w-full max-w-md">
      <Alert>
        <AlertIcon>{@render bellIcon()}</AlertIcon>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>
          A new version of the dashboard is available - refresh to pick up the latest features.
        </AlertDescription>
      </Alert>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex w-full max-w-md flex-col gap-3">
      {#each VARIANTS as { variant, icon, title, desc } (variant)}
        <Alert {variant}>
          <AlertIcon>{@render variantIcon(icon)}</AlertIcon>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{desc}</AlertDescription>
        </Alert>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Inline layout</p>
    <div class="w-full max-w-xl">
      <Alert layout="inline" variant="info">
        <AlertIcon>{@render infoIcon()}</AlertIcon>
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>Some features may be unavailable Sunday night.</AlertDescription>
      </Alert>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">With actions</p>
    <div class="w-full max-w-md">
      <Alert variant="warning">
        <AlertIcon>{@render warningIcon()}</AlertIcon>
        <AlertTitle>Your trial ends in 3 days</AlertTitle>
        <AlertDescription>Upgrade now to keep access to your projects and team members.</AlertDescription>
        <AlertAction>
          <Button variant="ghost" size="sm" class="hover:before:bg-background">Maybe later</Button>
          <Button size="sm">Upgrade</Button>
        </AlertAction>
      </Alert>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Dismissible</p>
    <div class="w-full max-w-md">
      <Alert variant="success" dismissible>
        <AlertIcon>{@render checkIcon()}</AlertIcon>
        <AlertTitle>Profile updated</AlertTitle>
        <AlertDescription>Your changes have been saved. You can dismiss this message.</AlertDescription>
      </Alert>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <div class="flex w-full max-w-md flex-col items-center gap-4">
      <div class="w-full">
        <Alert variant="info" bind:open={controlledOpen} dismissible>
          <AlertIcon>{@render infoIcon()}</AlertIcon>
          <AlertTitle>Good to know</AlertTitle>
          <AlertDescription>This banner is controlled. Dismiss it and bring it back below.</AlertDescription>
        </Alert>
      </div>
      {#if !controlledOpen}
        <Button variant="outline" size="sm" onclick={() => (controlledOpen = true)}>Show alert</Button>
      {/if}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Persist</p>
    <div class="flex w-full max-w-md flex-col items-center gap-4">
      <div class="w-full">
        {#key persistNonce}
          <Alert variant="secondary" dismissible persistKey={PERSIST_KEY}>
            <AlertIcon>{@render infoIcon()}</AlertIcon>
            <AlertTitle>Welcome back</AlertTitle>
            <AlertDescription>
              Dismissal is stored in localStorage under `{PERSIST_KEY}`. Reset it to show the alert again.
            </AlertDescription>
          </Alert>
        {/key}
      </div>
      <Button variant="outline" size="sm" onclick={resetPersist}>Reset dismissal</Button>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="w-full max-w-xl">
        <Alert layout="inline" variant="warning" dismissible>
          <AlertIcon>{@render warningIcon()}</AlertIcon>
          <AlertTitle>Storage almost full</AlertTitle>
          <AlertDescription>You have used 92% of your quota.</AlertDescription>
          <AlertAction>
            <Button size="sm">Manage</Button>
          </AlertAction>
        </Alert>
      </div>
    </DirectionProvider>
  </div>
</section>
