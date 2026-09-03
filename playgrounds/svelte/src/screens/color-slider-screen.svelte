<script lang="ts">
  import {
    ColorArea,
    ColorSlider,
    ColorSwatch,
    DirectionProvider,
    Switch,
    formatChannelValue,
    formatColor,
    parseColor,
    type Color,
    type ColorChannel,
  } from '@appica/ui-svelte'

  const RGB_CHANNELS = ['red', 'green', 'blue'] as const satisfies readonly ColorChannel[]

  let pickerColor: Color = $state(parseColor('hsb(217, 76%, 96%)'))
  let mixerColor: Color = $state(parseColor('rgb(59, 130, 246)'))
  let alphaColor: Color = $state(parseColor('rgba(59, 130, 246, 0.6)'))
  let verticalColor: Color = $state(parseColor('hsb(217, 76%, 96%)'))
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">ColorSlider</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <ColorSlider channel="hue" defaultValue="hsb(217, 76%, 96%)" class="max-w-70" />
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
    <p class="text-foreground-muted text-sm">Any channel</p>
    <div class="flex w-full max-w-70 flex-col gap-3">
      {#each RGB_CHANNELS as channel (channel)}
        <div class="flex items-center gap-3">
          <span class="text-foreground-muted w-10 text-xs capitalize">{channel}</span>
          <ColorSlider {channel} bind:value={mixerColor} class="flex-1" />
          <span class="text-foreground-muted w-8 text-end text-xs tabular-nums">
            {formatChannelValue(mixerColor, channel)}
          </span>
        </div>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Alpha</p>
    <div class="flex w-full max-w-70 flex-col gap-3">
      <ColorSlider channel="alpha" bind:value={alphaColor} />
      <span class="text-foreground-muted font-mono text-xs">{formatColor(alphaColor)}</span>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Vertical</p>
    <div class="flex items-end gap-4">
      <ColorSlider channel="hue" orientation="vertical" bind:value={verticalColor} />
      <ColorSlider channel="saturation" orientation="vertical" bind:value={verticalColor} />
      <ColorSlider channel="brightness" orientation="vertical" bind:value={verticalColor} />
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizing</p>
    <div class="flex w-full max-w-70 flex-col gap-4">
      <ColorSlider
        channel="hue"
        defaultValue="hsb(217, 76%, 96%)"
        class="h-2"
        thumbProps={{ class: 'size-4' }}
      />
      <ColorSlider channel="hue" defaultValue="hsb(140, 76%, 96%)" />
      <ColorSlider
        channel="hue"
        defaultValue="hsb(30, 76%, 96%)"
        class="h-10 rounded-xl"
        thumbProps={{ class: 'size-7' }}
      />
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled</p>
    <ColorSlider channel="hue" defaultValue="hsb(217, 76%, 96%)" disabled class="max-w-70" />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="max-w-70">
        <ColorSlider channel="hue" defaultValue="hsb(217, 76%, 96%)" />
      </div>
    </DirectionProvider>
  </div>
</section>
