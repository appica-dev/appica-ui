<script lang="ts">
  import {
    Button,
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
    type ColorFormat,
  } from '@appica/ui-svelte'

  const PLANES = [
    { space: 'rgb', xChannel: 'red', yChannel: 'green', label: 'RGB' },
    { space: 'hsl', xChannel: 'saturation', yChannel: 'lightness', label: 'HSL' },
    { space: 'hsb', xChannel: 'saturation', yChannel: 'brightness', label: 'HSB' },
  ] as const

  const FORMATS = ['hex', 'rgb', 'hsl', 'hsb'] as const satisfies readonly ColorFormat[]
  const RGB_CHANNELS = ['red', 'green', 'blue'] as const satisfies readonly ColorChannel[]

  let pickerColor: Color = $state(parseColor('hsb(217, 76%, 96%)'))
  let formatsColor: Color = $state(parseColor('#3b82f6'))
  let channelsColor: Color = $state(parseColor('rgb(59, 130, 246)'))
  let submitted: string | null = $state(null)
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">ColorArea</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <ColorArea defaultValue="hsb(217, 76%, 96%)" xChannel="saturation" yChannel="brightness" />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Color spaces</p>
    <div class="grid grid-cols-3 gap-6">
      {#each PLANES as { space, xChannel, yChannel, label } (space)}
        <div class="flex flex-col items-center gap-2">
          <ColorArea
            defaultValue="#3b82f6"
            colorSpace={space}
            {xChannel}
            {yChannel}
            aria-label={`${label} color area`}
            class="size-32"
          />
          <span class="text-foreground-muted text-xs font-medium">{label}</span>
        </div>
      {/each}
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
    <p class="text-foreground-muted text-sm">Output formats</p>
    <div class="flex w-64 flex-col gap-4">
      <ColorArea
        bind:value={formatsColor}
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
        aria-label="Theme color"
        class="size-64"
      />
      <dl class="grid gap-1 text-xs">
        {#each FORMATS as format (format)}
          <div class="flex gap-2">
            <dt class="text-foreground-muted w-8">{format}</dt>
            <dd class="text-foreground-intense font-mono">{formatColor(formatsColor, format)}</dd>
          </div>
        {/each}
      </dl>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Choosing channels</p>
    <div class="flex flex-col gap-3">
      <ColorArea bind:value={channelsColor} xChannel="red" yChannel="blue" aria-label="Red and blue" class="size-56" />
      <dl class="text-foreground-muted grid grid-cols-3 gap-2 text-xs tabular-nums">
        {#each RGB_CHANNELS as channel (channel)}
          <div class="flex flex-col">
            <dt class="capitalize">{channel}</dt>
            <dd class="text-foreground-intense font-medium">{formatChannelValue(channelsColor, channel)}</dd>
          </div>
        {/each}
      </dl>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizing</p>
    <div class="flex w-full max-w-90 flex-col gap-4">
      <ColorArea
        defaultValue="hsb(280, 70%, 90%)"
        xChannel="saturation"
        yChannel="brightness"
        aria-label="Wide color area"
        class="h-32 w-full rounded-2xl"
      />
      <div class="flex items-end gap-4">
        <ColorArea
          defaultValue="hsb(140, 70%, 90%)"
          xChannel="saturation"
          yChannel="brightness"
          aria-label="Small color area"
          class="size-16 rounded-full"
          thumbProps={{ class: 'size-4' }}
        />
        <ColorArea
          defaultValue="hsb(30, 70%, 90%)"
          xChannel="saturation"
          yChannel="brightness"
          aria-label="Medium color area"
          class="size-24 rounded-xs"
        />
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Forms</p>
    <form
      class="flex flex-col items-start gap-4"
      onsubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        submitted = `saturation ${data.get('saturation')}, brightness ${data.get('brightness')}`
      }}
    >
      <ColorArea
        defaultValue="hsb(217, 76%, 96%)"
        xChannel="saturation"
        yChannel="brightness"
        xName="saturation"
        yName="brightness"
        aria-label="Brand color"
        class="size-40"
      />
      <Button type="submit" size="sm">Submit</Button>
      {#if submitted}
        <p class="text-foreground-muted font-mono text-xs">{submitted}</p>
      {/if}
    </form>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled</p>
    <ColorArea
      defaultValue="hsb(217, 76%, 96%)"
      xChannel="saturation"
      yChannel="brightness"
      aria-label="Brand color"
      disabled
      class="size-40"
    />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        <ColorArea
          defaultValue="hsb(217, 76%, 96%)"
          xChannel="saturation"
          yChannel="brightness"
          aria-label="Saturation and brightness"
        />
      </div>
    </DirectionProvider>
  </div>
</section>
