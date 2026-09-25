<script lang="ts">
  import { At, Search } from '@appica/icons-svelte'
  import { DirectionProvider, Input, Switch } from '@appica/ui-svelte'

  const variants = ['outline', 'soft'] as const
  const sizes = ['sm', 'md', 'lg'] as const

  let email = $state('ada@example.com')
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

{#snippet searchIcon()}
  <Search class="size-4" />
{/snippet}

{#snippet atIcon()}
  <At />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Input</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex max-w-xs flex-col gap-3">
      {#each variants as variant (variant)}
        <Input {variant} placeholder={variant} />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex max-w-xs flex-col gap-3">
      {#each sizes as inputSize (inputSize)}
        <Input {inputSize} placeholder={inputSize} />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Start and end</p>
    <Input class="max-w-xs" placeholder="Search" start={searchIcon} end={atIcon} />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Clearable</p>
    <Input class="max-w-xs" clearable bind:value={email} placeholder="Email" />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled, read-only, error</p>
    <div class="flex max-w-xs flex-col gap-3">
      <Input disabled placeholder="Disabled" />
      <Input readonly value="Read only" />
      <Input aria-invalid="true" value="taken@example.com" />
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="max-w-xs">
        <Input placeholder="Search" start={searchIcon} clearable />
      </div>
    </DirectionProvider>
  </div>
</section>
