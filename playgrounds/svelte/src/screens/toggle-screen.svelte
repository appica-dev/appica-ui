<script lang="ts">
  import { Toggle, ToggleGroup, buttonVariants } from '@appica/ui-svelte'

  let bold = $state(false)
  let align = $state('left')
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Toggle</h2>

  <div class="flex flex-wrap items-center gap-2">
    <Toggle
      bind:pressed={bold}
      class={buttonVariants({ variant: 'outline', size: 'sm' })}
      aria-label="Bold"
    >
      Bold
    </Toggle>
    <Toggle class={buttonVariants({ variant: 'outline', size: 'sm' })} defaultPressed>Italic</Toggle>
    <Toggle class={buttonVariants({ variant: 'outline', size: 'sm' })} disabled>Disabled</Toggle>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Group single-select ({align})</p>
    <ToggleGroup bind:value={align} aria-label="Text alignment">
      <Toggle value="left" class={buttonVariants({ variant: 'outline', size: 'sm' })}>Left</Toggle>
      <Toggle value="center" class={buttonVariants({ variant: 'outline', size: 'sm' })}>Center</Toggle>
      <Toggle value="right" class={buttonVariants({ variant: 'outline', size: 'sm' })}>Right</Toggle>
    </ToggleGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Group multiple-select</p>
    <ToggleGroup multiple defaultValue={['bold']} aria-label="Text style">
      <Toggle value="bold" class={buttonVariants({ variant: 'outline', size: 'sm' })}>Bold</Toggle>
      <Toggle value="italic" class={buttonVariants({ variant: 'outline', size: 'sm' })}>Italic</Toggle>
      <Toggle value="underline" class={buttonVariants({ variant: 'outline', size: 'sm' })}>Underline</Toggle>
    </ToggleGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Vertical group</p>
    <ToggleGroup orientation="vertical" defaultValue="sm" aria-label="Size">
      <Toggle value="sm" class={buttonVariants({ variant: 'outline', size: 'sm' })}>SM</Toggle>
      <Toggle value="md" class={buttonVariants({ variant: 'outline', size: 'sm' })}>MD</Toggle>
      <Toggle value="lg" class={buttonVariants({ variant: 'outline', size: 'sm' })}>LG</Toggle>
    </ToggleGroup>
  </div>
</section>
