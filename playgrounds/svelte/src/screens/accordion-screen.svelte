<script lang="ts">
  import { Bell, ChevronDown, ChevronUp, CreditCard } from '@appica/icons-svelte'
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    DirectionProvider,
    Switch,
    Thumbnail,
  } from '@appica/ui-svelte'

  const VARIANTS = ['default', 'alt', 'flush'] as const

  const CONTROLLED_ITEMS = [
    {
      value: 'install',
      title: 'Install dependencies',
      body: 'Restore the lockfile and pull the package cache so every build starts from the same baseline.',
    },
    {
      value: 'test',
      title: 'Run the test suite',
      body: 'Unit and integration tests run in parallel; a single failure stops the pipeline before deploy.',
    },
    {
      value: 'deploy',
      title: 'Deploy to production',
      body: 'A green build promotes the artifact behind a canary, then rolls out to the rest of the fleet.',
    },
  ]

  let dir: 'ltr' | 'rtl' = $state<'ltr' | 'rtl'>('ltr')
  let controlledValue = $state('test')
  const controlledIndex = $derived(CONTROLLED_ITEMS.findIndex((item) => item.value === controlledValue))

  function step(delta: number) {
    const next = CONTROLLED_ITEMS[Math.min(CONTROLLED_ITEMS.length - 1, Math.max(0, controlledIndex + delta))]
    if (next) controlledValue = next.value
  }
</script>

{#snippet bellIcon()}
  <Bell />
{/snippet}

{#snippet creditCardIcon()}
  <CreditCard />
{/snippet}

{#snippet chevronUp()}
  <ChevronUp />
{/snippet}

{#snippet chevronDown()}
  <ChevronDown />
{/snippet}

{#snippet defaultFaq()}
  <Accordion class="max-w-110" defaultValue="shipping">
    <AccordionItem value="shipping">
      <AccordionTrigger>How long does shipping take?</AccordionTrigger>
      <AccordionContent>
        Orders ship within one business day and arrive in 3-5 days with standard delivery.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="returns">
      <AccordionTrigger>What is your return policy?</AccordionTrigger>
      <AccordionContent>Return any unused item within 30 days for a full refund - no questions asked.</AccordionContent>
    </AccordionItem>
    <AccordionItem value="support">
      <AccordionTrigger>How do I contact support?</AccordionTrigger>
      <AccordionContent>
        Reach our team any time at support@example.com; we reply within a few hours.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Accordion</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Default</p>
    {@render defaultFaq()}
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="grid w-full max-w-110 gap-6">
      {#each VARIANTS as variant (variant)}
        <div>
          <p class="text-foreground-muted mb-2 text-xs font-medium tracking-wide uppercase">{variant}</p>
          <Accordion {variant} defaultValue="one">
            <AccordionItem value="one">
              <AccordionTrigger>First section</AccordionTrigger>
              <AccordionContent>
                The {variant} variant changes the surface, borders, and spacing.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="two">
              <AccordionTrigger>Second section</AccordionTrigger>
              <AccordionContent>Each item still animates its panel height open and closed.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Icons</p>
    <div class="grid w-full max-w-110 gap-6">
      <Accordion icon="plus" defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger>Plus icon</AccordionTrigger>
          <AccordionContent>The plus morphs into a minus as the panel opens.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Second item</AccordionTrigger>
          <AccordionContent>Set icon="plus" on the Accordion to apply it to every trigger.</AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion icon="chevron" iconVariant="icon-box" iconPosition="start" defaultValue="c">
        <AccordionItem value="c">
          <AccordionTrigger>Boxed icon, leading</AccordionTrigger>
          <AccordionContent>
            iconVariant="icon-box" wraps the icon in a tile; iconPosition="start" moves it ahead of the label.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="d">
          <AccordionTrigger>Second item</AccordionTrigger>
          <AccordionContent>The boxed icon sits in a bordered tile that matches the item's surface.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Open multiple</p>
    <Accordion class="max-w-110" multiple defaultValue={['plan', 'billing']}>
      <AccordionItem value="plan">
        <AccordionTrigger>Plan</AccordionTrigger>
        <AccordionContent>You're on the Pro plan, renewing on the 1st of each month.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="billing">
        <AccordionTrigger>Billing</AccordionTrigger>
        <AccordionContent>Invoices are emailed to your account owner and available in Settings.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="team">
        <AccordionTrigger>Team</AccordionTrigger>
        <AccordionContent>Invite up to 10 teammates on your current plan.</AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Disabled item</p>
    <Accordion class="max-w-110" defaultValue="available">
      <AccordionItem value="available">
        <AccordionTrigger>Available section</AccordionTrigger>
        <AccordionContent>This item opens and closes as usual.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="locked" disabled>
        <AccordionTrigger>Locked section</AccordionTrigger>
        <AccordionContent>A disabled item can't be opened and is skipped by keyboard navigation.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="another">
        <AccordionTrigger>Another section</AccordionTrigger>
        <AccordionContent>Focus moves straight here, past the locked item above.</AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Leading media</p>
    <Accordion class="max-w-110">
      <AccordionItem value="notifications">
        <AccordionTrigger>
          {@render bellIcon()}
          Notifications
        </AccordionTrigger>
        <AccordionContent>Choose which emails and push alerts you'd like to receive.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="billing">
        <AccordionTrigger>
          <Thumbnail variant="icon-outline" size="sm" shape="rounded" class="-my-1">
            {@render creditCardIcon()}
          </Thumbnail>
          Billing
        </AccordionTrigger>
        <AccordionContent>Manage your payment method and download past invoices.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="region">
        <AccordionTrigger>
          <svg class="size-6" viewBox="0 0 24 24" aria-hidden="true">
            <rect width="24" height="24" rx="6" fill="#012169"></rect>
            <path d="M0 0 L24 24 M24 0 L0 24" stroke="#fff" stroke-width="4"></path>
            <path d="M0 0 L24 24 M24 0 L0 24" stroke="#C8102E" stroke-width="2"></path>
            <path d="M12 0 V24 M0 12 H24" stroke="#fff" stroke-width="6"></path>
            <path d="M12 0 V24 M0 12 H24" stroke="#C8102E" stroke-width="3"></path>
          </svg>
          Region & language
        </AccordionTrigger>
        <AccordionContent>
          Set your country, preferred language, and the currency shown across the app.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="account">
        <AccordionTrigger>
          <Avatar size="xs">
            <AvatarImage src="https://picsum.photos/80" alt="Sarah Jenkins" />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
          Account
        </AccordionTrigger>
        <AccordionContent>Update your profile details, email address, and password.</AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <div class="flex w-full max-w-110 flex-col gap-3">
      <div class="flex items-center justify-between">
        <p class="text-foreground-muted text-sm">
          Expanded: <span class="text-foreground-intense font-medium">{controlledValue}</span>
        </p>
        <div class="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={controlledIndex <= 0}
            onclick={() => step(-1)}
            aria-label="Previous section"
          >
            {@render chevronUp()}
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={controlledIndex >= CONTROLLED_ITEMS.length - 1}
            onclick={() => step(1)}
            aria-label="Next section"
          >
            {@render chevronDown()}
          </Button>
        </div>
      </div>
      <Accordion icon={false} value={controlledValue} onValueChange={(next) => (controlledValue = next as string)}>
        {#each CONTROLLED_ITEMS as item (item.value)}
          <AccordionItem value={item.value}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>{item.body}</AccordionContent>
          </AccordionItem>
        {/each}
      </Accordion>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="w-full max-w-110">
        {@render defaultFaq()}
      </div>
    </DirectionProvider>
  </div>
</section>
