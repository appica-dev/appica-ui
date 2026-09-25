<script lang="ts">
  import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from '@appica/icons-svelte'
  import { DirectionProvider, Switch, Toggle, ToggleGroup, buttonVariants } from '@appica/ui-svelte'

  const SWATCHES = [
    { value: 'sage', name: 'Sage', color: '#8fb478' },
    { value: 'terracotta', name: 'Terracotta', color: '#cc8259' },
    { value: 'sand', name: 'Sand', color: '#d9ba6e' },
    { value: 'blush', name: 'Blush', color: '#db9385' },
    { value: 'denim', name: 'Denim', color: '#7e9cc9' },
  ]

  let color = $state('sage')
  let dir: 'ltr' | 'rtl' = $state('ltr')
  const selected = $derived(SWATCHES.find((swatch) => swatch.value === color))

  const iconClass = buttonVariants({ variant: 'ghost', size: 'icon-md' })
</script>

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

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">ToggleGroup</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Single selection</p>
    <ToggleGroup aria-label="Text alignment" defaultValue="center">
      <Toggle value="left" aria-label="Align left" class={iconClass}>{@render alignLeft()}</Toggle>
      <Toggle value="center" aria-label="Align center" class={iconClass}>{@render alignCenter()}</Toggle>
      <Toggle value="right" aria-label="Align right" class={iconClass}>{@render alignRight()}</Toggle>
    </ToggleGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Multiple selection</p>
    <ToggleGroup aria-label="Text formatting" multiple defaultValue={['bold']}>
      <Toggle value="bold" aria-label="Bold" class={iconClass}>{@render boldIcon()}</Toggle>
      <Toggle value="italic" aria-label="Italic" class={iconClass}>{@render italicIcon()}</Toggle>
      <Toggle value="underline" aria-label="Underline" class={iconClass}>{@render underlineIcon()}</Toggle>
    </ToggleGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Vertical orientation</p>
    <ToggleGroup aria-label="Text alignment" orientation="vertical" defaultValue="left">
      <Toggle value="left" aria-label="Align left" class={iconClass}>{@render alignLeft()}</Toggle>
      <Toggle value="center" aria-label="Align center" class={iconClass}>{@render alignCenter()}</Toggle>
      <Toggle value="right" aria-label="Align right" class={iconClass}>{@render alignRight()}</Toggle>
    </ToggleGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled</p>
    <ToggleGroup aria-label="Text alignment" disabled defaultValue="center">
      <Toggle value="left" aria-label="Align left" class={iconClass}>{@render alignLeft()}</Toggle>
      <Toggle value="center" aria-label="Align center" class={iconClass}>{@render alignCenter()}</Toggle>
      <Toggle value="right" aria-label="Align right" class={iconClass}>{@render alignRight()}</Toggle>
    </ToggleGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Color swatches</p>
    <div class="flex flex-col items-start gap-3">
      <span class="text-foreground-muted text-sm">
        Color - <span class="text-foreground-intense font-medium">{selected?.name}</span>
      </span>
      <ToggleGroup
        aria-label="Swatch color"
        class="gap-3"
        bind:value={color}
        onValueChange={(next) => {
          if (typeof next === 'string' && next) color = next
        }}
      >
        {#each SWATCHES as swatch (swatch.value)}
          <Toggle
            value={swatch.value}
            aria-label={swatch.name}
            style="background-color: {swatch.color}"
            class="after:ring-border-inverse outline-ring relative size-4 rounded-full outline-offset-2 transition-transform after:pointer-events-none after:absolute after:-inset-0.5 after:scale-50 after:rounded-full after:opacity-0 after:ring-1 after:transition after:duration-200 after:ease-[cubic-bezier(0.175,0.885,0.32,1.5)] active:scale-90 data-pressed:after:scale-100 data-pressed:after:opacity-100 motion-reduce:transition-none motion-reduce:after:transition-none"
          />
        {/each}
      </ToggleGroup>
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
        <ToggleGroup aria-label="RTL alignment" defaultValue="center">
          <Toggle value="left" aria-label="Align left" class={iconClass}>{@render alignLeft()}</Toggle>
          <Toggle value="center" aria-label="Align center" class={iconClass}>{@render alignCenter()}</Toggle>
          <Toggle value="right" aria-label="Align right" class={iconClass}>{@render alignRight()}</Toggle>
        </ToggleGroup>
      </div>
    </DirectionProvider>
  </div>
</section>
