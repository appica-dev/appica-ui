<script lang="ts">
  import {
    Button,
    ColorArea,
    ColorPicker,
    ColorPickerInput,
    ColorSlider,
    ColorSwatch,
    ColorSwatchPicker,
    ColorSwatchPickerItem,
    DirectionProvider,
    Field,
    FieldLabel,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    formatColor,
    getColorChannels,
    parseColor,
    safeParseColor,
    type Color,
    type ColorSpace,
  } from '@appica/ui-svelte'

  type PanelSpace = Extract<ColorSpace, 'rgb' | 'hsl' | 'hsb'>

  const VARIANTS = ['ghost', 'outline', 'soft', 'flush'] as const
  const SPACES: PanelSpace[] = ['rgb', 'hsl', 'hsb']
  const PRESETS = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6', '#3b82f6', '#a855f7', '#ec4899']
  const FORMATS = ['hex', 'rgb', 'hsl', 'oklch'] as const

  let space = $state<PanelSpace>('rgb')
  let controlled = $state(parseColor('#3b82f6'))
  let fieldColor = $state<Color>(parseColor('#3b82f6'))
  let fieldText = $state('#3b82f6')
  let fieldOpen = $state(false)
  let fieldEl: HTMLDivElement | undefined = $state()
  let submitted = $state<string | null>(null)
  let dir: 'ltr' | 'rtl' = $state('ltr')

  function writeField(next: Color) {
    fieldColor = next
    fieldText = formatColor(next, 'hex')
  }

  const fieldPopoverProps = $derived({
    customAnchor: fieldEl,
    trapFocus: false,
    onOpenAutoFocus: (event: Event) => event.preventDefault(),
    onCloseAutoFocus: (event: Event) => event.preventDefault(),
    onInteractOutside: (event: Event) => {
      if (event.target instanceof Node && fieldEl?.contains(event.target)) event.preventDefault()
    },
  })
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">ColorPicker</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <ColorPicker defaultValue="#3b82f6" label="Brand color" />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Custom children</p>
    <ColorPicker defaultValue="#3b82f6" label="Accent">
      <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" aria-label="Saturation and brightness" />
      <ColorSlider channel="hue" />
      <ColorSwatchPicker aria-label="Presets">
        <ColorSwatchPickerItem color="#ef4444" />
        <ColorSwatchPickerItem color="#22c55e" />
      </ColorSwatchPicker>
    </ColorPicker>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex flex-wrap items-center gap-4">
      {#each VARIANTS as variant (variant)}
        <ColorPicker {variant} defaultValue="#3b82f6" label={variant} />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Custom panels</p>
    <ColorPicker defaultValue="#118844" label="Fill color" alpha popoverProps={{ class: 'w-56' }}>
      <Select
        size="sm"
        value={space}
        onValueChange={(next) => {
          if (typeof next === 'string') space = next as PanelSpace
        }}
      >
        <SelectTrigger aria-label="Color space">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {#each SPACES as option (option)}
            <SelectItem value={option} label={option.toUpperCase()}>{option.toUpperCase()}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
      {#each getColorChannels(space) as channel (channel)}
        <ColorSlider colorSpace={space} {channel} />
      {/each}
      <ColorSlider channel="alpha" />
      <ColorPickerInput />
    </ColorPicker>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Presets</p>
    <ColorPicker defaultValue="#3b82f6" label="Accent">
      <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" aria-label="Saturation and brightness" />
      <ColorSlider channel="hue" />
      <ColorSwatchPicker aria-label="Presets" size="xs" shape="circle">
        {#each PRESETS as preset (preset)}
          <ColorSwatchPickerItem color={preset} />
        {/each}
      </ColorSwatchPicker>
      <ColorPickerInput />
    </ColorPicker>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Opacity</p>
    <div class="flex flex-wrap items-center gap-4">
      <ColorPicker defaultValue="#3b82f6" label="Opaque" />
      <ColorPicker defaultValue="#3b82f699" label="Translucent" alpha />
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Eyedropper</p>
    <ColorPicker defaultValue="#f59e0b" label="Sample" eyedropper />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Inline</p>
    <ColorPicker inline alpha aria-label="Brand color" defaultValue="#a855f7" />
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Custom triggers</p>
    <div class="flex flex-wrap items-center gap-8">
      <ColorPicker defaultValue="#0ea5e9" label={null} aria-label="Stroke color" />
      <ColorPicker
        defaultValue="#22c55e"
        aria-label="Background color"
        class="outline-ring group flex cursor-pointer items-center gap-3 rounded-full outline-offset-3 focus-visible:outline-2"
      >
        {#snippet trigger()}
          <ColorSwatch size={32} shape="circle" aria-hidden="true" />
          <span class="text-sm font-medium underline-offset-4 group-hover:underline">Background</span>
        {/snippet}
      </ColorPicker>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">As a form field</p>
    <form
      class="flex flex-col items-start gap-4"
      onsubmit={(event) => {
        event.preventDefault()
        submitted = String(new FormData(event.currentTarget).get('brand'))
      }}
    >
      <Field class="w-52">
        <FieldLabel>Brand color</FieldLabel>
        <div bind:this={fieldEl} onfocusin={() => (fieldOpen = true)}>
          <Input
            class="font-mono"
            value={fieldText}
            onfocus={() => (fieldOpen = true)}
            onkeydown={(event) => {
              if (event.key === 'Escape') fieldOpen = false
            }}
            oninput={(event) => {
              fieldText = event.currentTarget.value
              const parsed = safeParseColor(fieldText)
              if (parsed) fieldColor = parsed
            }}
            onblur={() => (fieldText = formatColor(fieldColor, 'hex'))}
          >
            {#snippet start()}
              <ColorSwatch color={fieldColor} size={20} shape="circle" />
            {/snippet}
          </Input>
        </div>
        <ColorPicker
          aria-label="Brand color"
          name="brand"
          trigger={null}
          bind:value={fieldColor}
          onValueChange={writeField}
          bind:open={fieldOpen}
          popoverProps={fieldPopoverProps}
        />
      </Field>
      <Button type="submit" size="sm">Submit</Button>
      {#if submitted}
        <p class="text-foreground-muted font-mono text-xs">brand={submitted}</p>
      {/if}
    </form>
  </div>

  <div class="flex w-68 flex-col items-start gap-4">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <ColorPicker bind:value={controlled} variant="flush" label="Theme color" />
    <dl class="grid gap-1 text-xs">
      {#each FORMATS as format (format)}
        <div class="flex gap-2">
          <dt class="text-foreground-muted w-10">{format}</dt>
          <dd class="text-foreground-intense font-mono">{formatColor(controlled, format)}</dd>
        </div>
      {/each}
    </dl>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled</p>
    <div class="flex flex-wrap items-start gap-8">
      <ColorPicker defaultValue="#3b82f6" label="Locked" disabled />
      <ColorPicker inline disabled aria-label="Locked panel" defaultValue="#3b82f6" />
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
        <ColorPicker defaultValue="#3b82f6" label="Brand color" />
      </div>
    </DirectionProvider>
  </div>
</section>
