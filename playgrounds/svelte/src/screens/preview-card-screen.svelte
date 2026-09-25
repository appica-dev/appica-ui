<script lang="ts">
  import { StarFilled } from '@appica/icons-svelte'
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    DirectionProvider,
    PreviewCard,
    PreviewCardContent,
    PreviewCardTrigger,
    Switch,
  } from '@appica/ui-svelte'

  const LINK_CLASS = 'text-primary font-medium underline-offset-4 hover:underline'
  const PLACEMENTS = [
    { side: 'top', align: 'start' },
    { side: 'right', align: 'center' },
    { side: 'bottom', align: 'end' },
    { side: 'left', align: 'center' },
  ] as const

  let controlledOpen = $state(false)
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

{#snippet starIcon()}
  <StarFilled class="text-warning-emphasis size-4" />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Preview card</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Usage</p>
    <p class="text-foreground-muted text-center">
      Hover or focus
      <PreviewCard>
        <PreviewCardTrigger href="https://appica.dev" class={LINK_CLASS}>@appica_ui</PreviewCardTrigger>
        <PreviewCardContent>
          <p class="text-foreground-intense font-semibold">Appica UI</p>
          <p class="text-sm">An accessible Svelte component library.</p>
        </PreviewCardContent>
      </PreviewCard>
      to preview the linked page.
    </p>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Profile preview</p>
    <p class="text-foreground-muted text-center">
      Built and maintained by the team at
      <PreviewCard>
        <PreviewCardTrigger href="#!" class={LINK_CLASS}>@appica_ui</PreviewCardTrigger>
        <PreviewCardContent class="w-72">
          <div class="flex items-center justify-between">
            <Avatar>
              <AvatarImage src="https://picsum.photos/80" alt="Appica UI" />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <Button size="sm">Follow</Button>
          </div>
          <div>
            <p class="text-foreground-intense font-semibold">Appica UI</p>
            <p class="text-foreground-muted text-sm">@appica_ui</p>
          </div>
          <p class="text-sm">An accessible Svelte component library built on bits-ui and Tailwind.</p>
          <p class="text-foreground-muted text-sm">
            <span class="text-foreground-intense font-medium">2,481</span> followers
          </p>
        </PreviewCardContent>
      </PreviewCard>
      on GitHub.
    </p>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Media preview</p>
    <p class="text-foreground-muted text-center">
      Our next offsite is at the
      <PreviewCard>
        <PreviewCardTrigger href="#!" class={LINK_CLASS}>Coastal House</PreviewCardTrigger>
        <PreviewCardContent arrow={false} class="w-72 gap-0 overflow-hidden p-0">
          <img src="https://picsum.photos/id/1015/576/328" alt="Coastal House" class="h-41 w-full object-cover" />
          <div class="flex flex-col gap-1 p-4">
            <div class="flex items-center justify-between">
              <p class="text-foreground-intense font-semibold">Coastal House</p>
              <span class="text-foreground-muted flex items-center gap-1 text-sm">
                {@render starIcon()}
                4.9
              </span>
            </div>
            <p class="text-sm">A bright, open workspace overlooking the bay - room for 24.</p>
          </div>
        </PreviewCardContent>
      </PreviewCard>
      next month.
    </p>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Side & alignment</p>
    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      {#each PLACEMENTS as { side, align } (`${side}-${align}`)}
        <PreviewCard>
          <PreviewCardTrigger href="#!" class="text-primary text-sm font-medium underline-offset-4 hover:underline">
            {side} / {align}
          </PreviewCardTrigger>
          <PreviewCardContent {side} {align}>
            <p class="text-foreground-intense font-semibold">{side} / {align}</p>
            <p class="text-sm">The card flips and shifts automatically to stay in view.</p>
          </PreviewCardContent>
        </PreviewCard>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Without an arrow</p>
    <p class="text-foreground-muted text-center">
      Read more in the
      <PreviewCard>
        <PreviewCardTrigger href="#!" class={LINK_CLASS}>getting started</PreviewCardTrigger>
        <PreviewCardContent arrow={false} class="w-64">
          <p class="text-foreground-intense font-semibold">Getting started</p>
          <p class="text-sm">Install the package, import the styles, and drop your first component in.</p>
        </PreviewCardContent>
      </PreviewCard>
      guide.
    </p>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Positioner theming</p>
    <p class="text-foreground-muted text-center">
      Opened from a light region, the popup still renders dark via
      <PreviewCard>
        <PreviewCardTrigger href="#!" class={LINK_CLASS}>positionerProps</PreviewCardTrigger>
        <PreviewCardContent positionerProps={{ class: 'dark' }}>
          <p class="text-foreground-intense font-semibold">Dark popup</p>
          <p class="text-sm">The class lands on the positioner so tokens inherit inside the portal.</p>
        </PreviewCardContent>
      </PreviewCard>
      .
    </p>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Delay</p>
    <p class="text-foreground-muted text-sm">Delay lives on the root (openDelay / closeDelay), not the trigger.</p>
    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      <PreviewCard>
        <PreviewCardTrigger href="#!" class={LINK_CLASS}>Default 600 / 300</PreviewCardTrigger>
        <PreviewCardContent>
          <p class="text-foreground-intense font-semibold">Default delay</p>
          <p class="text-sm">Opens after 600ms, closes after 300ms.</p>
        </PreviewCardContent>
      </PreviewCard>
      <PreviewCard openDelay={200} closeDelay={100}>
        <PreviewCardTrigger href="#!" class={LINK_CLASS}>Fast 200 / 100</PreviewCardTrigger>
        <PreviewCardContent>
          <p class="text-foreground-intense font-semibold">Fast delay</p>
          <p class="text-sm">Opens after 200ms, closes after 100ms.</p>
        </PreviewCardContent>
      </PreviewCard>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={controlledOpen} onCheckedChange={(next) => (controlledOpen = next)} />
      Open
    </label>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <PreviewCard bind:open={controlledOpen}>
        <PreviewCardTrigger href="#!" class={LINK_CLASS}>Hover or toggle</PreviewCardTrigger>
        <PreviewCardContent>
          <p class="text-foreground-intense font-semibold">Controlled</p>
          <p class="text-sm">Open state is bound to the switch.</p>
        </PreviewCardContent>
      </PreviewCard>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <PreviewCard>
          <PreviewCardTrigger href="#!" class={LINK_CLASS}>start</PreviewCardTrigger>
          <PreviewCardContent side="bottom" align="start">
            <p class="text-foreground-intense font-semibold">Align start</p>
            <p class="text-sm">Mirrors with the reading direction.</p>
          </PreviewCardContent>
        </PreviewCard>
        <PreviewCard>
          <PreviewCardTrigger href="#!" class={LINK_CLASS}>end</PreviewCardTrigger>
          <PreviewCardContent side="bottom" align="end">
            <p class="text-foreground-intense font-semibold">Align end</p>
            <p class="text-sm">Mirrors with the reading direction.</p>
          </PreviewCardContent>
        </PreviewCard>
      </div>
    </DirectionProvider>
  </div>
</section>
