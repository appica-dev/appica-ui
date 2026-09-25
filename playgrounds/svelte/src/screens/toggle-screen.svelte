<script lang="ts">
  import { Bell, BellOff, Bold, Italic, Underline } from '@appica/icons-svelte'
  import { DirectionProvider, Switch, Toggle, buttonVariants } from '@appica/ui-svelte'

  let enabled = $state(true)
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

{#snippet boldIcon()}
  <Bold />
{/snippet}
{#snippet italicIcon()}
  <Italic />
{/snippet}
{#snippet underlineIcon()}
  <Underline />
{/snippet}
{#snippet bellIcon()}
  <Bell />
{/snippet}
{#snippet bellOffIcon()}
  <BellOff />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Toggle</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Composing with Button</p>
    <div class="flex items-center gap-2">
      <Toggle defaultPressed aria-label="Bold" class={buttonVariants({ variant: 'outline', size: 'icon-md' })}>
        {@render boldIcon()}
      </Toggle>
      <Toggle aria-label="Italic" class={buttonVariants({ variant: 'outline', size: 'icon-md' })}>
        {@render italicIcon()}
      </Toggle>
      <Toggle aria-label="Underline" class={buttonVariants({ variant: 'outline', size: 'icon-md' })}>
        {@render underlineIcon()}
      </Toggle>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">States</p>
    <div class="flex flex-wrap items-center gap-3">
      <Toggle aria-label="Off" class={buttonVariants({ variant: 'outline', size: 'md' })}>Off</Toggle>
      <Toggle defaultPressed aria-label="Pressed" class={buttonVariants({ variant: 'outline', size: 'md' })}>Pressed</Toggle>
      <Toggle disabled aria-label="Disabled" class={buttonVariants({ variant: 'outline', size: 'md' })}>Disabled</Toggle>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <div class="flex w-full max-w-74 items-center justify-between gap-4 rounded-xl border p-4">
      <div class="flex flex-col gap-0.5">
        <span class="text-foreground-intense text-sm font-medium">Notifications</span>
        <span class="text-foreground-muted text-xs">
          {enabled ? "You'll be notified about new activity" : 'All notifications are paused'}
        </span>
      </div>
      <Toggle
        pressed={enabled}
        onPressedChange={(next) => (enabled = next)}
        aria-label={enabled ? 'Mute notifications' : 'Enable notifications'}
        class={buttonVariants({ variant: enabled ? 'primary' : 'soft', size: 'icon-md' })}
      >
        {#if enabled}
          {@render bellIcon()}
        {:else}
          {@render bellOffIcon()}
        {/if}
      </Toggle>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="flex items-center gap-2">
        <Toggle defaultPressed aria-label="Bold" class={buttonVariants({ variant: 'outline', size: 'icon-md' })}>
          {@render boldIcon()}
        </Toggle>
        <Toggle aria-label="Italic" class={buttonVariants({ variant: 'outline', size: 'icon-md' })}>
          {@render italicIcon()}
        </Toggle>
      </div>
    </DirectionProvider>
  </div>
</section>
