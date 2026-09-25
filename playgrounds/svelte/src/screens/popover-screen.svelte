<script lang="ts">
  import { Adjustments, Check, InfoCircle } from '@appica/icons-svelte'
  import {
    DirectionProvider,
    Field,
    FieldLabel,
    Input,
    NavigationLink,
    Popover,
    PopoverClose,
    PopoverContent,
    PopoverDescription,
    PopoverTitle,
    PopoverTrigger,
    Switch,
    buttonVariants,
  } from '@appica/ui-svelte'

  const PRESETS = [
    { emoji: '🟢', label: 'Active' },
    { emoji: '🗓️', label: 'In a meeting' },
    { emoji: '🎧', label: 'Focusing' },
    { emoji: '🌴', label: 'On vacation' },
    { emoji: '🤒', label: 'Out sick' },
  ] as const

  type Status = (typeof PRESETS)[number]

  const PLACEMENTS = [
    { side: 'top', align: 'start' },
    { side: 'right', align: 'center' },
    { side: 'bottom', align: 'end' },
    { side: 'left', align: 'center' },
  ] as const

  let open = $state(false)
  let status = $state<Status>(PRESETS[0])
  let dir: 'ltr' | 'rtl' = $state('ltr')
  let width = $state('320')
  let height = $state('180')
</script>

{#snippet adjustmentsIcon()}
  <Adjustments data-icon="start" />
{/snippet}

{#snippet infoIcon()}
  <InfoCircle />
{/snippet}

{#snippet checkIcon()}
  <Check data-icon="end" class="text-primary ms-auto" />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Popover</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Usage</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Popover>
        <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>Open</PopoverTrigger>
        <PopoverContent>
          <PopoverTitle>Share this page</PopoverTitle>
          <PopoverDescription>Anyone with the link can view this document.</PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Form in a popover</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Popover>
        <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>
          {@render adjustmentsIcon()}
          Dimensions
        </PopoverTrigger>
        <PopoverContent class="w-72">
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the size of the selected layer.</PopoverDescription>
          <div class="mt-1 grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Width</FieldLabel>
              <Input bind:value={width} inputmode="numeric" />
            </Field>
            <Field>
              <FieldLabel>Height</FieldLabel>
              <Input bind:value={height} inputmode="numeric" />
            </Field>
          </div>
          <div class="mt-2 flex justify-end gap-2">
            <PopoverClose class={buttonVariants({ variant: 'ghost', size: 'sm' })}>Cancel</PopoverClose>
            <PopoverClose class={buttonVariants({ size: 'sm' })}>Apply</PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Popover bind:open>
        <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>
          <span aria-hidden="true">{status.emoji}</span>
          {status.label}
        </PopoverTrigger>
        <PopoverContent align="start" class="w-60 gap-0.5 p-1.5">
          <PopoverTitle class="text-foreground-muted px-2 pt-1 pb-1.5 text-xs font-medium">Set a status</PopoverTitle>
          {#each PRESETS as preset (preset.label)}
            <NavigationLink
              el="button"
              orientation="vertical"
              active={preset.label === status.label}
              class="w-full"
              onclick={() => {
                status = preset
                open = false
              }}
            >
              <span aria-hidden="true">{preset.emoji}</span>
              {preset.label}
              {#if preset.label === status.label}
                {@render checkIcon()}
              {/if}
            </NavigationLink>
          {/each}
        </PopoverContent>
      </Popover>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Open on hover</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Popover>
        <PopoverTrigger
          openOnHover
          delay={150}
          class={buttonVariants({ variant: 'ghost', size: 'icon-md' })}
          aria-label="Plan details"
        >
          {@render infoIcon()}
        </PopoverTrigger>
        <PopoverContent side="top">
          <PopoverTitle>Pro plan</PopoverTitle>
          <PopoverDescription>
            Unlimited projects, priority support, and 100 GB of storage. Renews monthly.
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Without an arrow</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Popover>
        <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>No arrow</PopoverTrigger>
        <PopoverContent arrow={false}>
          <PopoverTitle>Cleaner edge</PopoverTitle>
          <PopoverDescription>
            Dropping the arrow pulls the popup closer to the trigger and removes the pointer and the thicker anchored
            border.
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Side & alignment</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      {#each PLACEMENTS as { side, align } (`${side}-${align}`)}
        <Popover>
          <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>{side} / {align}</PopoverTrigger>
          <PopoverContent {side} {align}>
            <PopoverTitle>{side} / {align}</PopoverTitle>
            <PopoverDescription>The popup flips and shifts automatically to stay in view.</PopoverDescription>
          </PopoverContent>
        </Popover>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Positioner theming</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Popover>
        <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>positionerProps</PopoverTrigger>
        <PopoverContent positionerProps={{ class: 'dark' }}>
          <PopoverTitle>Dark popup</PopoverTitle>
          <PopoverDescription>The class lands on the positioner so tokens inherit inside the portal.</PopoverDescription>
        </PopoverContent>
      </Popover>
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
        <Popover>
          <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>start</PopoverTrigger>
          <PopoverContent side="bottom" align="start">
            <PopoverTitle>Align start</PopoverTitle>
            <PopoverDescription>Mirrors with the reading direction.</PopoverDescription>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>end</PopoverTrigger>
          <PopoverContent side="bottom" align="end">
            <PopoverTitle>Align end</PopoverTitle>
            <PopoverDescription>Mirrors with the reading direction.</PopoverDescription>
          </PopoverContent>
        </Popover>
      </div>
    </DirectionProvider>
  </div>
</section>
