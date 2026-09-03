<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Color, ColorChannel } from '../../lib/color'
  import type { ColorControlSpace } from '../../internal/color-control'

  export type ColorAreaProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
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
     * Color space the axes operate in. Defaults to the space of the value, so a color
     * parsed from `hsl(...)` gives an HSL area and a hex one gives an RGB area. The
     * space is independent of the format you store: convert on the way out.
     */
    colorSpace?: ColorControlSpace
    /**
     * Channel mapped to the horizontal axis. Defaults to the first channel of the color
     * space that `yChannel` has not taken.
     */
    xChannel?: ColorChannel
    /**
     * Channel mapped to the vertical axis, increasing upwards. Defaults to the first
     * channel of the color space left free by `xChannel`.
     */
    yChannel?: ColorChannel
    /**
     * Prevent interaction and dim the area.
     * @default false
     */
    disabled?: boolean
    /** Name of the hidden horizontal input, used when submitting an HTML form. */
    xName?: string
    /** Name of the hidden vertical input, used when submitting an HTML form. */
    yName?: string
    /** `id` of the `<form>` the hidden inputs belong to, when they sit outside it. */
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
    getColorChannels,
    getColorSpaceAxes,
    parseColor,
    withChannelValue,
  } from '../../lib/color'

  const DEFAULT_VALUE = '#ffffff'
  const rootClasses = `${COLOR_CONTROL_GROUP} ${colorControlRootClasses} size-56 rounded-lg`

  interface PlaneProps {
    space: ColorControlSpace
    xChannel: ColorChannel
    yChannel: ColorChannel
    zChannel: ColorChannel
    zValue: number
    mirrored: boolean
  }

  function gradientBackground({ space, xChannel, yChannel, zChannel, zValue, mirrored }: PlaneProps): string {
    const end = mirrored ? 'left' : 'right'

    if (space === 'rgb') {
      const black = parseColor('rgb(0, 0, 0)')
      const only = (channel: ColorChannel, channelValue: number) =>
        formatColor(withChannelValue(black, channel, channelValue))
      return [
        `linear-gradient(to ${end}, ${only(xChannel, 0)}, ${only(xChannel, 255)})`,
        `linear-gradient(to top, ${only(yChannel, 0)}, ${only(yChannel, 255)})`,
        `linear-gradient(${only(zChannel, zValue)}, ${only(zChannel, zValue)})`,
      ].join(', ')
    }

    const base = withChannelValue(
      parseColor(space === 'hsl' ? 'hsl(0, 100%, 50%)' : 'hsb(0, 100%, 100%)'),
      zChannel,
      zValue,
    )

    const stops = (channel: ColorChannel): string => {
      switch (channel) {
        case 'hue':
          return [0, 60, 120, 180, 240, 300, 360]
            .map((hue) => formatColor(withChannelValue(base, 'hue', hue)))
            .join(', ')
        case 'saturation':
          return `${formatColor(withChannelValue(base, 'saturation', 0))}, transparent`
        case 'lightness':
          return 'black, transparent, white'
        default:
          return 'black, transparent'
      }
    }

    const layers = [`linear-gradient(to top, ${stops(yChannel)})`, `linear-gradient(to ${end}, ${stops(xChannel)})`]
    if (zChannel === 'hue') layers.push(`linear-gradient(${formatColor(base)}, ${formatColor(base)})`)
    return layers.join(', ')
  }

  let {
    value = $bindable(),
    defaultValue = DEFAULT_VALUE,
    onValueChange,
    onValueCommitted,
    colorSpace,
    xChannel: xChannelProp,
    yChannel: yChannelProp,
    disabled: disabledProp,
    xName,
    yName,
    form,
    thumbProps,
    class: className,
    children,
    style,
    'aria-label': ariaLabel = 'Color picker',
    ...rest
  }: ColorAreaProps & { children?: Snippet } = $props()

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
  const disabled = $derived(control.disabled)
  const space = $derived(resolveControlSpace(control.color.space, undefined, colorSpace))
  const color = $derived(convertColor(control.color, space))
  const axes = $derived(getColorSpaceAxes(space, { xChannel: xChannelProp, yChannel: yChannelProp }))
  const xChannel = $derived(axes.xChannel)
  const yChannel = $derived(axes.yChannel)
  const zChannel = $derived(axes.zChannel)
  const xRange = $derived(getChannelRange(space, xChannel))
  const yRange = $derived(getChannelRange(space, yChannel))
  const xValue = $derived(getChannelValue(color, xChannel))
  const yValue = $derived(getChannelValue(color, yChannel))
  const zValue = $derived(getChannelValue(color, zChannel))
  const background = $derived(gradientBackground({ space, xChannel, yChannel, zChannel, zValue, mirrored }))
  const valueText = $derived(
    getColorChannels(space)
      .map((channel) => `${getChannelName(channel)} ${formatChannelValue(color, channel)}`)
      .join(', '),
  )
  const classes = $derived(cn(rootClasses, className))
  const thumbClass = $derived(cn(colorControlThumbClasses, thumbProps?.class))

  let containerEl: HTMLDivElement | undefined = $state()
  let xInputEl: HTMLInputElement | undefined = $state()
  let yInputEl: HTMLInputElement | undefined = $state()
  let dragging = $state(false)
  let focusedAxis = $state<'x' | 'y'>('x')
  let latestColor: Color = untrack(() => color)

  $effect(() => {
    latestColor = color
  })

  function setColor(next: Color) {
    latestColor = next
    control.setColor(next)
  }

  function setChannel(channel: ColorChannel, next: number) {
    const channelRange = getChannelRange(space, channel)
    const snapped = snapToStep(next, channelRange.minValue, channelRange.maxValue, channelRange.step)
    if (snapped === getChannelValue(latestColor, channel)) return
    setColor(withChannelValue(latestColor, channel, snapped))
  }

  function setFromPoint(clientX: number, clientY: number) {
    const rect = containerEl?.getBoundingClientRect()
    if (!rect?.width || !rect.height) return

    const ratioX = (clientX - rect.left) / rect.width
    const x = Math.min(Math.max(mirrored ? 1 - ratioX : ratioX, 0), 1)
    const y = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1)

    const nextX = snapToStep(
      xRange.minValue + x * (xRange.maxValue - xRange.minValue),
      xRange.minValue,
      xRange.maxValue,
      xRange.step,
    )
    const nextY = snapToStep(
      yRange.minValue + (1 - y) * (yRange.maxValue - yRange.minValue),
      yRange.minValue,
      yRange.maxValue,
      yRange.step,
    )

    const current = latestColor
    if (nextX === getChannelValue(current, xChannel) && nextY === getChannelValue(current, yChannel)) return
    setColor(withChannelValue(withChannelValue(current, xChannel, nextX), yChannel, nextY))
  }

  function handlePointerDown(event: PointerEvent) {
    if (disabled || event.button !== 0) return
    dragging = true
    setFromPoint(event.clientX, event.clientY)
    xInputEl?.focus({ preventScroll: true })
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
    const xStep = event.shiftKey ? xRange.pageSize : xRange.step
    const yStep = event.shiftKey ? yRange.pageSize : yRange.step
    const sign = mirrored ? -1 : 1

    const moves: Record<string, [ColorChannel, number, 'x' | 'y'] | undefined> = {
      ArrowLeft: [xChannel, -sign * xStep, 'x'],
      ArrowRight: [xChannel, sign * xStep, 'x'],
      ArrowUp: [yChannel, yStep, 'y'],
      ArrowDown: [yChannel, -yStep, 'y'],
      PageUp: [yChannel, yRange.pageSize, 'y'],
      PageDown: [yChannel, -yRange.pageSize, 'y'],
      Home: [xChannel, -sign * xRange.pageSize, 'x'],
      End: [xChannel, sign * xRange.pageSize, 'x'],
    }

    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    const [channel, delta, axis] = move
    setChannel(channel, getChannelValue(latestColor, channel) + delta)
    focusedAxis = axis
    ;(axis === 'x' ? xInputEl : yInputEl)?.focus({ preventScroll: true })
    control.commitColor(latestColor)
  }
</script>

<div
  bind:this={containerEl}
  role="group"
  aria-label={ariaLabel}
  data-slot="color-area"
  data-space={space}
  data-disabled={disabled ? '' : undefined}
  data-dragging={dragging ? '' : undefined}
  class={classes}
  style:background-image={disabled ? undefined : background}
  style:background-blend-mode={disabled || space !== 'rgb' ? undefined : 'screen'}
  {style}
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={endDrag}
  onpointercancel={endDrag}
  {...rest}
>
  <span data-slot="color-area-surface" aria-hidden="true" class={colorControlSurfaceClasses}></span>

  <input
    bind:this={xInputEl}
    type="range"
    class="sr-only"
    {form}
    {disabled}
    name={xName}
    min={xRange.minValue}
    max={xRange.maxValue}
    step={xRange.step}
    value={xValue}
    tabindex={focusedAxis === 'x' ? 0 : -1}
    aria-label={`${ariaLabel}, ${getChannelName(xChannel)}`}
    aria-valuetext={valueText}
    aria-orientation="horizontal"
    aria-roledescription="two-dimensional slider"
    onfocus={() => (focusedAxis = 'x')}
    onkeydown={handleKeyDown}
    oninput={(event) => setChannel(xChannel, Number.parseFloat(event.currentTarget.value))}
  />
  <input
    bind:this={yInputEl}
    type="range"
    class="sr-only"
    {form}
    {disabled}
    name={yName}
    min={yRange.minValue}
    max={yRange.maxValue}
    step={yRange.step}
    value={yValue}
    tabindex={focusedAxis === 'y' ? 0 : -1}
    aria-label={`${ariaLabel}, ${getChannelName(yChannel)}`}
    aria-valuetext={valueText}
    aria-orientation="vertical"
    aria-roledescription="two-dimensional slider"
    onfocus={() => (focusedAxis = 'y')}
    onkeydown={handleKeyDown}
    oninput={(event) => setChannel(yChannel, Number.parseFloat(event.currentTarget.value))}
  />

  <span
    {...thumbProps}
    data-slot="color-area-thumb"
    data-disabled={disabled ? '' : undefined}
    data-dragging={dragging ? '' : undefined}
    class={thumbClass}
    style:inset-inline-start={`${((xValue - xRange.minValue) / (xRange.maxValue - xRange.minValue)) * 100}%`}
    style:top={`${(1 - (yValue - yRange.minValue) / (yRange.maxValue - yRange.minValue)) * 100}%`}
    style:background-color={disabled ? undefined : formatColor(withChannelValue(color, 'alpha', 1))}
  ></span>

  {@render children?.()}
</div>
