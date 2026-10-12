'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import {
  COLOR_CONTROL_GROUP,
  type ColorControlSpace,
  colorControlCheckerboard,
  colorControlCheckerboardSize,
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
  parseColor,
  withChannelValue,
} from '../../lib/color'

const DEFAULT_VALUE = '#ffffff'

type ColorSliderOrientation = 'horizontal' | 'vertical'

/**
 * The color the track ramps through, which is not always the value. Hue reads best
 * at full saturation rather than as a ramp through whatever the current color is,
 * and alpha is the one channel that keeps its own transparency.
 */
function trackColor(color: Color, channel: ColorChannel): Color {
  if (channel === 'hue') return parseColor(`hsl(${getChannelValue(color, 'hue')}, 100%, 50%)`)
  return channel === 'alpha' ? color : withChannelValue(color, 'alpha', 1)
}

/** A point along the track, `inset` in from each end - the range the thumb reaches. */
function offsetAt(fraction: number, inset: number): string {
  if (inset === 0) return `${fraction * 100}%`
  if (fraction === 0) return `${inset}px`
  if (fraction === 1) return `calc(100% - ${inset}px)`
  return `calc(${inset}px + (100% - ${inset * 2}px) * ${fraction})`
}

/**
 * Lays the stops across the thumb's travel rather than the track's full width, so the
 * color under the thumb is the color the slider reports. CSS extends the first and
 * last stop to the ends on its own, which caps the pill in the channel's min and max -
 * the same result HeroUI draws with a pseudo-element at each end.
 */
function ramp(colors: string[], to: string, inset: number): string {
  const last = colors.length - 1
  const stops = colors.map((color, index) => (inset === 0 ? color : `${color} ${offsetAt(index / last, inset)}`))
  return `linear-gradient(to ${to}, ${stops.join(', ')})`
}

function trackBackground(color: Color, channel: ColorChannel, to: string, inset: number): string {
  const base = trackColor(color, channel)
  const at = (value: number) => formatColor(withChannelValue(base, channel, value))

  if (channel === 'hue') {
    const hues = [0, 60, 120, 180, 240, 300, 360].map((hue) => formatColor(withChannelValue(base, 'hue', hue)))
    return ramp(hues, to, inset)
  }

  const { minValue, maxValue } = getChannelRange(base.space, channel)
  // Lightness needs the midpoint stop, or the hue drops out and the ramp is just
  // black to white.
  const colors =
    channel === 'lightness' ? [at(minValue), at((minValue + maxValue) / 2), at(maxValue)] : [at(minValue), at(maxValue)]
  return ramp(colors, to, inset)
}

const rootClasses = `${COLOR_CONTROL_GROUP} ${colorControlRootClasses} rounded-full data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-40 data-[orientation=vertical]:w-5`

interface ColorSliderProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'defaultValue' | 'onChange'> {
  /** Channel the track ramps through, and the one the slider changes. */
  channel: ColorChannel
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
  thumbProps?: React.ComponentPropsWithoutRef<'span'>
}

function ColorSlider({
  channel,
  value,
  defaultValue = DEFAULT_VALUE,
  onValueChange,
  onValueCommitted,
  colorSpace,
  orientation = 'horizontal',
  disabled: disabledProp,
  name,
  form,
  thumbProps,
  className,
  children,
  'aria-label': ariaLabel,
  ...props
}: ColorSliderProps) {
  const mirrored = useDirection() === 'rtl'
  const vertical = orientation === 'vertical'
  const alpha = channel === 'alpha'

  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const thumbRef = React.useRef<HTMLSpanElement>(null)

  const [dragging, setDragging] = React.useState(false)
  const [inset, setInset] = React.useState(0)

  const control = useColorControl({ value, defaultValue, onValueChange, onValueCommitted, disabled: disabledProp })
  const disabled = control.disabled
  const space = resolveControlSpace(control.color.space, channel, colorSpace)
  const color = convertColor(control.color, space)

  const range = getChannelRange(space, channel)
  const channelValue = getChannelValue(color, channel)
  const ratio = (channelValue - range.minValue) / (range.maxValue - range.minValue)

  const latestRef = React.useRef<Color>(color)
  latestRef.current = color

  // How far the thumb's center stays off each end: half a thumb, plus the clearance
  // it already has across the track, so it sits inside by the same margin all round.
  // Measured rather than assumed, since `thumbProps` can resize it.
  React.useEffect(() => {
    const track = containerRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return

    const measure = () => {
      // Layout sizes, not a bounding rect: the thumb scales while pressed, and a
      // rect would feed that transform back into the geometry.
      const along = vertical ? thumb.offsetHeight : thumb.offsetWidth
      const across = vertical ? thumb.offsetWidth : thumb.offsetHeight
      const thickness = vertical ? track.offsetWidth : track.offsetHeight
      setInset((along + thickness - across) / 2)
    }

    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    observer.observe(thumb)
    return () => observer.disconnect()
  }, [vertical])

  const setChannel = (next: number) => {
    const snapped = snapToStep(next, range.minValue, range.maxValue, range.step)
    if (snapped === getChannelValue(latestRef.current, channel)) return
    const updated = withChannelValue(latestRef.current, channel, snapped)
    latestRef.current = updated
    control.setColor(updated)
  }

  const setFromPoint = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect?.width || !rect.height) return
    const extent = (vertical ? rect.height : rect.width) - inset * 2
    if (extent <= 0) return
    const along = vertical ? 1 - (clientY - rect.top - inset) / extent : (clientX - rect.left - inset) / extent
    const fraction = Math.min(Math.max(mirrored && !vertical ? 1 - along : along, 0), 1)
    setChannel(range.minValue + fraction * (range.maxValue - range.minValue))
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return
    setDragging(true)
    setFromPoint(event.clientX, event.clientY)
    inputRef.current?.focus({ preventScroll: true })
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

    const current = getChannelValue(latestRef.current, channel)
    const next =
      event.key === 'Home'
        ? range.minValue
        : event.key === 'End'
          ? range.maxValue
          : current + (deltas[event.key] ?? NaN)
    if (Number.isNaN(next)) return

    event.preventDefault()
    setChannel(next)
    control.commitColor(latestRef.current)
  }

  const to = vertical ? 'top' : mirrored ? 'left' : 'right'
  const background = React.useMemo(() => trackBackground(color, channel, to, inset), [color, channel, to, inset])

  const offset = (fraction: number) => offsetAt(fraction, inset)

  const state = {
    'data-disabled': disabled ? '' : undefined,
    'data-dragging': dragging ? '' : undefined,
  }

  return (
    <div
      ref={containerRef}
      data-base-ui-swipe-ignore=""
      {...props}
      data-slot="color-slider"
      data-orientation={orientation}
      data-channel={channel}
      {...state}
      className={cn(rootClasses, className)}
      style={{
        backgroundImage: disabled ? undefined : alpha ? `${background}, ${colorControlCheckerboard}` : background,
        backgroundSize: !disabled && alpha ? `auto, ${colorControlCheckerboardSize}` : undefined,
        ...props.style,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <span data-slot="color-slider-surface" aria-hidden="true" className={colorControlSurfaceClasses} />

      <input
        ref={inputRef}
        type="range"
        className="sr-only"
        form={form}
        name={name}
        disabled={disabled}
        min={range.minValue}
        max={range.maxValue}
        step={range.step}
        value={channelValue}
        aria-label={ariaLabel ?? getChannelName(channel)}
        aria-orientation={orientation}
        aria-valuetext={`${formatChannelValue(color, channel)}, ${formatColor(withChannelValue(color, 'alpha', 1), 'hex')}`}
        onKeyDown={handleKeyDown}
        onChange={(event) => setChannel(Number.parseFloat(event.target.value))}
      />

      <span
        ref={thumbRef}
        data-slot="color-slider-thumb"
        {...state}
        {...thumbProps}
        className={cn(colorControlThumbClasses, thumbProps?.className)}
        style={{
          insetInlineStart: vertical ? '50%' : offset(ratio),
          top: vertical ? offset(1 - ratio) : '50%',
          backgroundColor: disabled ? undefined : formatColor(trackColor(color, channel)),
          ...thumbProps?.style,
        }}
      />

      {children}
    </div>
  )
}

export { ColorSlider }
export type { ColorSliderProps }
