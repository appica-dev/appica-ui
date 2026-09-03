<script lang="ts">
  import {
    ColorArea,
    ColorSlider,
    ColorSwatchPicker,
    ColorSwatchPickerItem,
    DirectionProvider,
    Switch,
    formatColor,
    parseColor,
    type Color,
  } from '@appica/ui-svelte'

  const palette = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']
  const shapePalette = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6']
  const sizePalette = ['#ef4444', '#22c55e', '#3b82f6']
  const sizes = ['2xs', 'sm', 'md', 'lg'] as const
  const namedPalette = [
    { color: '#0f172a', name: 'Midnight' },
    { color: '#ef4444', name: 'Rose red' },
    { color: '#f59e0b', name: 'Amber' },
    { color: '#22c55e', name: 'Meadow' },
    { color: '#3b82f6', name: 'Sky blue' },
  ]
  const tints = ['#3b82f6', 'rgba(59, 130, 246, 0.6)', 'rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)']
  const presets = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

  let namedColor: Color = $state(parseColor('#3b82f6'))
  let pickerColor: Color = $state(parseColor('#3b82f6'))
  let dir: 'ltr' | 'rtl' = $state('ltr')

  const selectedName = $derived(
    namedPalette.find(
      ({ color: swatch }) => formatColor(parseColor(swatch), 'hex') === formatColor(namedColor, 'hex'),
    )?.name,
  )
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">ColorSwatchPicker</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <ColorSwatchPicker aria-label="Accent color" defaultValue="#3b82f6">
      <ColorSwatchPickerItem color="#ef4444" />
      <ColorSwatchPickerItem color="#f59e0b" />
      <ColorSwatchPickerItem color="#3b82f6" />
    </ColorSwatchPicker>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Layouts</p>
    <div class="flex items-start gap-12">
      <ColorSwatchPicker aria-label="Accent color" defaultValue="#3b82f6" class="max-w-38">
        {#each palette as color (color)}
          <ColorSwatchPickerItem {color} />
        {/each}
      </ColorSwatchPicker>
      <ColorSwatchPicker aria-label="Accent color" layout="stack" defaultValue="#3b82f6">
        {#each palette.slice(0, 4) as color (color)}
          <ColorSwatchPickerItem {color} />
        {/each}
      </ColorSwatchPicker>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Shapes</p>
    <div class="flex flex-col items-center gap-6">
      <ColorSwatchPicker aria-label="Accent color" defaultValue="#22c55e">
        {#each shapePalette as color (color)}
          <ColorSwatchPickerItem {color} />
        {/each}
      </ColorSwatchPicker>
      <ColorSwatchPicker aria-label="Accent color" shape="circle" defaultValue="#22c55e">
        {#each shapePalette as color (color)}
          <ColorSwatchPickerItem {color} />
        {/each}
      </ColorSwatchPicker>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizing</p>
    <div class="flex flex-col items-center gap-6">
      {#each sizes as size (size)}
        <ColorSwatchPicker aria-label={`Accent color, ${size}`} {size} defaultValue="#3b82f6">
          {#each sizePalette as color (color)}
            <ColorSwatchPickerItem {color} />
          {/each}
        </ColorSwatchPicker>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Naming colors</p>
    <div class="flex flex-col items-center gap-3">
      <ColorSwatchPicker aria-label="Accent color" shape="circle" bind:value={namedColor}>
        {#each namedPalette as { color: swatch, name } (swatch)}
          <ColorSwatchPickerItem color={swatch} colorName={name} />
        {/each}
      </ColorSwatchPicker>
      <span class="text-sm">{selectedName}</span>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Translucent swatches</p>
    <ColorSwatchPicker aria-label="Overlay tint" defaultValue="rgba(59, 130, 246, 0.6)">
      {#each tints as color (color)}
        <ColorSwatchPickerItem {color} />
      {/each}
    </ColorSwatchPicker>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Alongside a picker</p>
    <div class="flex w-full max-w-56 flex-col gap-3">
      <ColorArea
        bind:value={pickerColor}
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
        aria-label="Saturation and brightness"
      />
      <ColorSlider channel="hue" bind:value={pickerColor} />
      <ColorSlider channel="alpha" bind:value={pickerColor} />
      <ColorSwatchPicker aria-label="Presets" size="sm" bind:value={pickerColor}>
        {#each presets as preset (preset)}
          <ColorSwatchPickerItem color={preset} />
        {/each}
      </ColorSwatchPicker>
      <span class="font-mono text-xs text-nowrap">
        {pickerColor.alpha < 1 ? formatColor(pickerColor, 'rgba') : formatColor(pickerColor, 'hex')}
      </span>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled</p>
    <div class="flex flex-col items-center gap-6">
      <ColorSwatchPicker aria-label="Accent color" defaultValue="#ef4444">
        <ColorSwatchPickerItem color="#ef4444" />
        <ColorSwatchPickerItem color="#f59e0b" disabled />
        <ColorSwatchPickerItem color="#22c55e" />
        <ColorSwatchPickerItem color="#3b82f6" disabled />
      </ColorSwatchPicker>
      <ColorSwatchPicker aria-label="Accent color" shape="circle" defaultValue="#ef4444" disabled>
        <ColorSwatchPickerItem color="#ef4444" />
        <ColorSwatchPickerItem color="#f59e0b" />
        <ColorSwatchPickerItem color="#22c55e" />
        <ColorSwatchPickerItem color="#3b82f6" />
      </ColorSwatchPicker>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="flex items-start gap-12">
        <ColorSwatchPicker aria-label="Accent color" defaultValue="#3b82f6" class="max-w-38">
          {#each palette as color (color)}
            <ColorSwatchPickerItem {color} />
          {/each}
        </ColorSwatchPicker>
        <ColorSwatchPicker aria-label="Accent color" layout="stack" defaultValue="#3b82f6">
          {#each palette.slice(0, 4) as color (color)}
            <ColorSwatchPickerItem {color} />
          {/each}
        </ColorSwatchPicker>
      </div>
    </DirectionProvider>
  </div>
</section>
