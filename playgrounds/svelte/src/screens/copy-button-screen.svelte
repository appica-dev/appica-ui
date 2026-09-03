<script lang="ts">
  import { CopyButton, DirectionProvider, Switch } from '@appica/ui-svelte'

  const variants = ['ghost', 'soft', 'outline', 'primary-outline', 'primary', 'secondary'] as const
  const iconSizes = ['icon-sm', 'icon-md', 'icon-lg'] as const

  let codeEl: HTMLElement | undefined = $state()
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">CopyButton</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <CopyButton value="npm install @appica/ui-svelte" />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex flex-wrap items-center gap-3">
      {#each variants as variant (variant)}
        <CopyButton value={variant} {variant} />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex items-center gap-3">
      {#each iconSizes as size (size)}
        <CopyButton value={size} variant="outline" {size} />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With a label</p>
    <CopyButton value="npm install @appica/ui-svelte" variant="outline" size="sm" copiedLabel="Copied!">
      Copy
    </CopyButton>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Copy from an element</p>
    <div class="border-border-muted bg-background-subtle relative w-full max-w-90 rounded-lg border py-3 ps-4 pe-12">
      <code bind:this={codeEl} class="text-foreground font-mono text-sm">npm install @appica/ui-svelte</code>
      <div class="absolute inset-e-2 top-1/2 -translate-y-1/2">
        {#if codeEl}
          <CopyButton value={codeEl} label="Copy command" />
        {/if}
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled</p>
    <CopyButton value="npm install @appica/ui-svelte" variant="outline" disabled />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        <CopyButton value="npm install @appica/ui-svelte" variant="outline" size="sm">Copy</CopyButton>
      </div>
    </DirectionProvider>
  </div>
</section>
