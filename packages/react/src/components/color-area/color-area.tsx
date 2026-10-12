'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import {
  COLOR_CONTROL_GROUP,
  type ColorControlSpace,
  colorControlRootClasses,
  colorControlSurfaceClasses,
  colorControlThumbClasses,
  resolveControlSpace,
  snapToStep,
} from '../../internal/color-control'
import { useColorControl } from '../../internal/color-picker-context'
import {
  type Color,
  type ColorChannel,
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

interface PlaneProps {
  space: ColorControlSpace
  xChannel: ColorChannel
  yChannel: ColorChannel
  zChannel: ColorChannel
  zValue: number
  mirrored: boolean
}

function gradientBackground({
  space,
  xChannel,
  yChannel,
  zChannel,
  zValue,
  mirrored,
}: PlaneProps): React.CSSProperties {
  const end = mirrored ? 'left' : 'right'

  if (space === 'rgb') {
    const black = parseColor('rgb(0, 0, 0)')
    const only = (channel: ColorChannel, value: number) => formatColor(withChannelValue(black, channel, value))
    return {
      // `screen` multiplies the inverses, so one channel per layer recombines them.
      backgroundImage: [
        `linear-gradient(to ${end}, ${only(xChannel, 0)}, ${only(xChannel, 255)})`,
        `linear-gradient(to top, ${only(yChannel, 0)}, ${only(yChannel, 255)})`,
        `linear-gradient(${only(zChannel, zValue)}, ${only(zChannel, zValue)})`,
      ].join(', '),
      backgroundBlendMode: 'screen',
    }
  }

  const base = withChannelValue(
    parseColor(space === 'hsl' ? 'hsl(0, 100%, 50%)' : 'hsb(0, 100%, 100%)'),
    zChannel,
    zValue,
  )

  const stops = (channel: ColorChannel): string => {
    switch (channel) {
      case 'hue':
        return [0, 60, 120, 180, 240, 300, 360].map((hue) => formatColor(withChannelValue(base, 'hue', hue))).join(', ')
      case 'saturation':
        return `${formatColor(withChannelValue(base, 'saturation', 0))}, transparent`
      case 'lightness':
        return 'black, transparent, white'
      default:
        return 'black, transparent'
    }
  }

  // Later layers paint underneath: the vertical one goes first so the horizontal
  // one shows through where it fades to transparent.
  const layers = [`linear-gradient(to top, ${stops(yChannel)})`, `linear-gradient(to ${end}, ${stops(xChannel)})`]
  if (zChannel === 'hue') layers.push(`linear-gradient(${formatColor(base)}, ${formatColor(base)})`)

  return { backgroundImage: layers.join(', ') }
}

const rootClasses = `${COLOR_CONTROL_GROUP} ${colorControlRootClasses} size-56 rounded-lg`

interface ColorAreaProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'defaultValue' | 'onChange'> {
  /**
   * Selected color. Pass a `Color` or any CSS color string to control the component.
   * Inside a `ColorPicker` it can be left off: the control then reads and writes the
   * picker's color.
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
  thumbProps?: React.ComponentPropsWithoutRef<'span'>
}

function ColorArea({
  value,
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
  className,
  children,
  'aria-label': ariaLabel = 'Color picker',
  ...props
}: ColorAreaProps) {
  const mirrored = useDirection() === 'rtl'

  const containerRef = React.useRef<HTMLDivElement>(null)
  const xInputRef = React.useRef<HTMLInputElement>(null)
  const yInputRef = React.useRef<HTMLInputElement>(null)

  const [dragging, setDragging] = React.useState(false)
  const [focusedAxis, setFocusedAxis] = React.useState<'x' | 'y'>('x')

  const control = useColorControl({ value, defaultValue, onValueChange, onValueCommitted, disabled: disabledProp })
  const disabled = control.disabled
  const space = resolveControlSpace(control.color.space, undefined, colorSpace)
  const color = convertColor(control.color, space)

  const { xChannel, yChannel, zChannel } = getColorSpaceAxes(space, {
    xChannel: xChannelProp,
    yChannel: yChannelProp,
  })
  const xRange = getChannelRange(space, xChannel)
  const yRange = getChannelRange(space, yChannel)
  const xValue = getChannelValue(color, xChannel)
  const yValue = getChannelValue(color, yChannel)
  const zValue = getChannelValue(color, zChannel)

  const latestRef = React.useRef<Color>(color)
  latestRef.current = color

  const setColor = (next: Color) => {
    latestRef.current = next
    control.setColor(next)
  }

  const setChannel = (channel: ColorChannel, next: number) => {
    const range = getChannelRange(space, channel)
    const snapped = snapToStep(next, range.minValue, range.maxValue, range.step)
    if (snapped === getChannelValue(latestRef.current, channel)) return
    setColor(withChannelValue(latestRef.current, channel, snapped))
  }

  const setFromPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
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

    const current = latestRef.current
    if (nextX === getChannelValue(current, xChannel) && nextY === getChannelValue(current, yChannel)) return
    setColor(withChannelValue(withChannelValue(current, xChannel, nextX), yChannel, nextY))
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return
    setDragging(true)
    setFromPoint(event.clientX, event.clientY)
    xInputRef.current?.focus({ preventScroll: true })
    try {
      // Capture last: it throws when the pointer is already gone, by which point the
      // press has been applied and a failure only costs tracking outside the element.
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {}
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) setFromPoint(event.clientX, event.clientY)
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
    control.commitColor(latestRef.current)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
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
    setChannel(channel, getChannelValue(latestRef.current, channel) + delta)
    setFocusedAxis(axis)
    ;(axis === 'x' ? xInputRef : yInputRef).current?.focus({ preventScroll: true })
    control.commitColor(latestRef.current)
  }

  const background = React.useMemo(
    () => gradientBackground({ space, xChannel, yChannel, zChannel, zValue, mirrored }),
    [space, xChannel, yChannel, zChannel, zValue, mirrored],
  )

  const valueText = getColorChannels(space)
    .map((channel) => `${getChannelName(channel)} ${formatChannelValue(color, channel)}`)
    .join(', ')

  const state = {
    'data-disabled': disabled ? '' : undefined,
    'data-dragging': dragging ? '' : undefined,
  }

  const axisInputProps = (axis: 'x' | 'y') => {
    const channel = axis === 'x' ? xChannel : yChannel
    const range = axis === 'x' ? xRange : yRange
    return {
      type: 'range' as const,
      className: 'sr-only',
      form,
      disabled,
      name: axis === 'x' ? xName : yName,
      min: range.minValue,
      max: range.maxValue,
      step: range.step,
      value: axis === 'x' ? xValue : yValue,
      tabIndex: focusedAxis === axis ? 0 : -1,
      'aria-label': `${ariaLabel}, ${getChannelName(channel)}`,
      'aria-valuetext': valueText,
      'aria-orientation': axis === 'x' ? ('horizontal' as const) : ('vertical' as const),
      'aria-roledescription': 'two-dimensional slider',
      onFocus: () => setFocusedAxis(axis),
      onKeyDown: handleKeyDown,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        setChannel(channel, Number.parseFloat(event.target.value)),
    }
  }

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={ariaLabel}
      data-base-ui-swipe-ignore=""
      {...props}
      data-slot="color-area"
      data-space={space}
      {...state}
      className={cn(rootClasses, className)}
      style={{ ...(disabled ? undefined : background), ...props.style }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <span data-slot="color-area-surface" aria-hidden="true" className={colorControlSurfaceClasses} />

      <input ref={xInputRef} {...axisInputProps('x')} />
      <input ref={yInputRef} {...axisInputProps('y')} />

      <span
        data-slot="color-area-thumb"
        {...state}
        {...thumbProps}
        className={cn(colorControlThumbClasses, thumbProps?.className)}
        style={{
          insetInlineStart: `${((xValue - xRange.minValue) / (xRange.maxValue - xRange.minValue)) * 100}%`,
          top: `${(1 - (yValue - yRange.minValue) / (yRange.maxValue - yRange.minValue)) * 100}%`,
          backgroundColor: disabled ? undefined : formatColor(withChannelValue(color, 'alpha', 1)),
          ...thumbProps?.style,
        }}
      />

      {children}
    </div>
  )
}

export { ColorArea }
export type { ColorAreaProps }
