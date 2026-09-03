<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Color, ColorChannel } from '../../lib/color'
  import type { ColorControlSpace } from '../../internal/color-control'

  export type ColorSliderOrientation = 'horizontal' | 'vertical'

  export type ColorSliderProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
    /** Channel the track ramps through, and the one the slider changes. */
    channel: ColorChannel
    /**
     * Selected color. Pass a `Color` or any CSS color string to control the component.
     * Pair with `onValueChange` or `bind:value`. Inside a `ColorPicker` it can be left
     * off: the control then reads and writes the picker's color.
     */
    value?: Color | string
    /**
     * Color selected before any interaction, when the component is uncontrolled.
     * @default '#ffffff'
     */
    defaultValue?: Color | string
    /** Fires on every change, including each frame of a drag. */
    onValueChange?: (value: Color) => void
    /** Fires once a drag ends or a key press settles, with the color that was landed on. */
    onValueCommitted?: (value: Color) => void
    /**
     * Color space the channel is read from. Defaults to the space of the value when it
     * carries `channel`, so a slider shares a color with an area without converting it.
     */
    colorSpace?: ColorControlSpace
    /**
     * Axis the track runs along. A vertical track fills from the bottom.
     * @default 'horizontal'
     */
    orientation?: ColorSliderOrientation
    /**
     * Prevent interaction and dim the track.
     * @default false
     */
    disabled?: boolean
    /** Name of the hidden input, used when submitting an HTML form. */
    name?: string
    /** `id` of the `<form>` the hidden input belongs to, when it sits outside it. */
    form?: string
    /** Props for the thumb element, for styling or a test id. */
    thumbProps?: HTMLAttributes<HTMLSpanElement>
  }
</script>

<script lang="ts">
  import { untrack, type Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { useDirection } from '../../hooks/use-direction/use-direction'
  import {
    COLOR_CONTROL_GROUP,
    colorControlCheckerboard,
    colorControlCheckerboardSize,
    colorControlRootClasses,
    colorControlSurfaceClasses,
    colorControlThumbClasses,
    resolveControlSpace,
    snapToStep,
  } from '../../internal/color-control'
  import { useColorControl } from '../../internal/color-picker-context.svelte'
  import {
    convertColor,
    formatChannelValue,
    formatColor,
    getChannelName,
    getChannelRange,
    getChannelValue,
    parseColor,
    withChannelValue,
  } from '../../lib/color'

  const DEFAULT_VALUE = '#ffffff'
  const rootClasses = `${COLOR_CONTROL_GROUP} ${colorControlRootClasses} rounded-full data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-40 data-[orientation=vertical]:w-5`

  function trackColor(color: Color, channel: ColorChannel): Color {
    if (channel === 'hue') return parseColor(`hsl(${getChannelValue(color, 'hue')}, 100%, 50%)`)
    return channel === 'alpha' ? color : withChannelValue(color, 'alpha', 1)
  }

  function offsetAt(fraction: number, insetPx: number): string {
    if (insetPx === 0) return `${fraction * 100}%`
    if (fraction === 0) return `${insetPx}px`
    if (fraction === 1) return `calc(100% - ${insetPx}px)`
    return `calc(${insetPx}px + (100% - ${insetPx * 2}px) * ${fraction})`
  }

  function ramp(colors: string[], to: string, insetPx: number): string {
    const last = colors.length - 1
    const stops = colors.map((stop, index) => (insetPx === 0 ? stop : `${stop} ${offsetAt(index / last, insetPx)}`))
    return `linear-gradient(to ${to}, ${stops.join(', ')})`
  }

  function trackBackground(color: Color, channel: ColorChannel, to: string, insetPx: number): string {
    const base = trackColor(color, channel)
    const at = (channelValue: number) => formatColor(withChannelValue(base, channel, channelValue))

    if (channel === 'hue') {
      const hues = [0, 60, 120, 180, 240, 300, 360].map((hue) => formatColor(withChannelValue(base, 'hue', hue)))
      return ramp(hues, to, insetPx)
    }

    const { minValue, maxValue } = getChannelRange(base.space, channel)
    const colors =
      channel === 'lightness'
        ? [at(minValue), at((minValue + maxValue) / 2), at(maxValue)]
        : [at(minValue), at(maxValue)]
    return ramp(colors, to, insetPx)
  }

  let {
    channel,
    value = $bindable(),
    defaultValue = DEFAULT_VALUE,
    onValueChange,
    onValueCommitted,
    colorSpace,
    orientation = 'horizontal',
    disabled: disabledProp,
    name,
    form,
    thumbProps,
    class: className,
    children,
    style,
    'aria-label': ariaLabel,
    ...rest
  }: ColorSliderProps & { children?: Snippet } = $props()

  const direction = useDirection()
  const control = useColorControl({
    get value() {
      return value
    },
    get defaultValue() {
      return defaultValue
    },
    setBound(next) {
      value = next
    },
    get onValueChange() {
      return onValueChange
    },
    get onValueCommitted() {
      return onValueCommitted
    },
    get disabled() {
      return disabledProp
    },
  })

  const mirrored = $derived(direction.current === 'rtl')
  const vertical = $derived(orientation === 'vertical')
  const alpha = $derived(channel === 'alpha')
  const disabled = $derived(control.disabled)
  const space = $derived(resolveControlSpace(control.color.space, channel, colorSpace))
  const color = $derived(convertColor(control.color, space))
  const range = $derived(getChannelRange(space, channel))
  const channelValue = $derived(getChannelValue(color, channel))
  const ratio = $derived((channelValue - range.minValue) / (range.maxValue - range.minValue))
  const to = $derived(vertical ? 'top' : mirrored ? 'left' : 'right')

  let containerEl: HTMLDivElement | undefined = $state()
  let inputEl: HTMLInputElement | undefined = $state()
  let thumbEl: HTMLSpanElement | undefined = $state()
  let dragging = $state(false)
  let inset = $state(0)
  let latestColor: Color = untrack(() => color)

  $effect(() => {
    latestColor = color
  })

  $effect(() => {
    const track = containerEl
    const thumb = thumbEl
    const isVertical = vertical
    if (!track || !thumb) return

    const measure = () => {
      const along = isVertical ? thumb.offsetHeight : thumb.offsetWidth
      const across = isVertical ? thumb.offsetWidth : thumb.offsetHeight
      const thickness = isVertical ? track.offsetWidth : track.offsetHeight
      inset = (along + thickness - across) / 2
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    observer.observe(thumb)
    return () => observer.disconnect()
  })

  const background = $derived(trackBackground(color, channel, to, inset))
  const offset = (fraction: number) => offsetAt(fraction, inset)
  const classes = $derived(cn(rootClasses, className))
  const thumbClass = $derived(cn(colorControlThumbClasses, thumbProps?.class))

  function setChannel(next: number) {
    const snapped = snapToStep(next, range.minValue, range.maxValue, range.step)
    if (snapped === getChannelValue(latestColor, channel)) return
    const updated = withChannelValue(latestColor, channel, snapped)
    latestColor = updated
    control.setColor(updated)
  }

  function setFromPoint(clientX: number, clientY: number) {
    const rect = containerEl?.getBoundingClientRect()
    if (!rect?.width || !rect.height) return
    const extent = (vertical ? rect.height : rect.width) - inset * 2
    if (extent <= 0) return
    const along = vertical ? 1 - (clientY - rect.top - inset) / extent : (clientX - rect.left - inset) / extent
    const fraction = Math.min(Math.max(mirrored && !vertical ? 1 - along : along, 0), 1)
    setChannel(range.minValue + fraction * (range.maxValue - range.minValue))
  }

  function handlePointerDown(event: PointerEvent) {
    if (disabled || event.button !== 0) return
    dragging = true
    setFromPoint(event.clientX, event.clientY)
    inputEl?.focus({ preventScroll: true })
    try {
      ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    } catch {
      /* the pointer is already gone */
    }
  }

  function handlePointerMove(event: PointerEvent) {
    if (dragging) setFromPoint(event.clientX, event.clientY)
  }

  function endDrag(event: PointerEvent) {
    if (!dragging) return
    const target = event.currentTarget as HTMLElement
    if (target.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId)
    }
    dragging = false
    control.commitColor(latestColor)
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (disabled) return
    const step = event.shiftKey ? range.pageSize : range.step
    const sign = mirrored && !vertical ? -1 : 1

    const deltas: Record<string, number | undefined> = {
      ArrowLeft: -sign * step,
      ArrowRight: sign * step,
      ArrowDown: -step,
      ArrowUp: step,
      PageDown: -range.pageSize,
      PageUp: range.pageSize,
    }

    const current = getChannelValue(latestColor, channel)
    const next =
      event.key === 'Home'
        ? range.minValue
        : event.key === 'End'
          ? range.maxValue
          : current + (deltas[event.key] ?? NaN)
    if (Number.isNaN(next)) return

    event.preventDefault()
    setChannel(next)
    control.commitColor(latestColor)
  }
</script>

<div
  bind:this={containerEl}
  data-slot="color-slider"
  data-orientation={orientation}
  data-channel={channel}
  data-disabled={disabled ? '' : undefined}
  data-dragging={dragging ? '' : undefined}
  class={classes}
  style:background-image={disabled ? undefined : alpha ? `${background}, ${colorControlCheckerboard}` : background}
  style:background-size={!disabled && alpha ? `auto, ${colorControlCheckerboardSize}` : undefined}
  {style}
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={endDrag}
  onpointercancel={endDrag}
  {...rest}
>
  <span data-slot="color-slider-surface" aria-hidden="true" class={colorControlSurfaceClasses}></span>

  <input
    bind:this={inputEl}
    type="range"
    class="sr-only"
    {form}
    {name}
    {disabled}
    min={range.minValue}
    max={range.maxValue}
    step={range.step}
    value={channelValue}
    aria-label={ariaLabel ?? getChannelName(channel)}
    aria-orientation={orientation}
    aria-valuetext={`${formatChannelValue(color, channel)}, ${formatColor(withChannelValue(color, 'alpha', 1), 'hex')}`}
    onkeydown={handleKeyDown}
    oninput={(event) => setChannel(Number.parseFloat(event.currentTarget.value))}
  />

  <span
    bind:this={thumbEl}
    {...thumbProps}
    data-slot="color-slider-thumb"
    data-disabled={disabled ? '' : undefined}
    data-dragging={dragging ? '' : undefined}
    class={thumbClass}
    style:inset-inline-start={vertical ? '50%' : offset(ratio)}
    style:top={vertical ? offset(1 - ratio) : '50%'}
    style:background-color={disabled ? undefined : formatColor(trackColor(color, channel))}
  ></span>

  {@render children?.()}
</div>
