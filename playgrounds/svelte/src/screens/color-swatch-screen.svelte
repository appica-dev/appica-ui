<script lang="ts">
  import { Check } from '@appica/icons-svelte'
  import {
    ColorArea,
    ColorPicker,
    ColorSlider,
    ColorSwatch,
    formatColor,
    parseColor,
    type Color,
    DirectionProvider,
    Switch,
  } from '@appica/ui-svelte'

  const parsed = parseColor('#3b82f6')
  const steps = [1, 0.75, 0.5, 0.25, 0.1]
  const sizes = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl'] as const

  let pickerColor: Color = $state(parseColor('hsb(217, 76%, 96%)'))
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">ColorSwatch</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <div class="flex items-center gap-4">
      <ColorSwatch color="#3b82f6" />
      <ColorSwatch color={parsed} />
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Opacity</p>
    <div class="flex flex-col items-center gap-6">
      <div class="flex items-center gap-4">
        {#each steps as alpha (alpha)}
          <ColorSwatch color={`rgba(59, 130, 246, ${alpha})`} />
        {/each}
      </div>
      <div class="flex items-center gap-4">
        {#each steps as alpha (alpha)}
          <ColorSwatch color={`rgba(59, 130, 246, ${alpha})`} checkerboard={false} />
        {/each}
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Shapes</p>
    <div class="flex items-center gap-4">
      <ColorSwatch color="#3b82f6" />
      <ColorSwatch color="#3b82f6" shape="circle" />
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizing</p>
    <div class="flex flex-col items-center gap-6">
      <div class="flex flex-wrap items-center justify-center gap-4">
        {#each sizes as size (size)}
          <ColorSwatch color="#3b82f6" {size} />
        {/each}
      </div>
      <div class="flex items-center gap-4">
        <ColorSwatch color="#a855f7" size={56} />
        <ColorSwatch color="#a855f7" class="size-24" />
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Building a picker</p>
    <div class="flex w-full max-w-56 flex-col gap-3">
      <ColorArea
        bind:value={pickerColor}
        xChannel="saturation"
        yChannel="brightness"
        aria-label="Saturation and brightness"
      />
      <ColorSlider channel="hue" bind:value={pickerColor} />
      <ColorSlider channel="alpha" bind:value={pickerColor} />
      <div class="flex items-center gap-3">
        <ColorSwatch color={pickerColor} />
        <span class="font-mono text-xs text-nowrap">
          {pickerColor.alpha < 1 ? formatColor(pickerColor, 'rgba') : formatColor(pickerColor, 'hex')}
        </span>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Inside a ColorPicker</p>
    <ColorPicker inline defaultValue="#3b82f6" aria-label="Brand color">
      <ColorSlider channel="hue" />
      <ColorSwatch />
    </ColorPicker>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled</p>
    <div class="flex items-center gap-4">
      <ColorSwatch color="#3b82f6" disabled />
      <ColorSwatch color="#3b82f6" shape="circle" disabled />
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Overlay</p>
    <ColorSwatch color="#22c55e">
      <Check size={16} stroke="white" />
    </ColorSwatch>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="flex items-center gap-4">
        <ColorSwatch color="#3b82f6" />
        <ColorSwatch color="#22c55e" shape="circle" />
      </div>
    </DirectionProvider>
  </div>
</section>
