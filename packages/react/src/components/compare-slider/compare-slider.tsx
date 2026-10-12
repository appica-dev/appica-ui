'use client'

import * as React from 'react'
import { useDirection } from '../../hooks/use-direction'
import { cn } from '../../internal/utils'

type CompareSliderOrientation = 'horizontal' | 'vertical'
type CompareSliderLabelPosition = 'top' | 'bottom'
type LabelCorner = `${CompareSliderLabelPosition}-${'start' | 'end'}`

/** How far a touch travels before it counts as a drag rather than a scroll, in pixels. */
const DRAG_THRESHOLD = 6
const STEP = 1
const PAGE_STEP = 10

const ROOT_ORIENTATION: Record<CompareSliderOrientation, string> = {
  horizontal: 'cursor-ew-resize touch-pan-y',
  vertical: 'cursor-ns-resize touch-pan-x',
}

const DIVIDER_ORIENTATION: Record<CompareSliderOrientation, string> = {
  horizontal: 'inset-y-0 w-0.5 ltr:-translate-x-1/2 rtl:translate-x-1/2',
  vertical: 'inset-x-0 h-0.5 -translate-y-1/2',
}

const HANDLE_ORIENTATION: Record<CompareSliderOrientation, string> = {
  horizontal: 'top-1/2 -translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2',
  vertical: 'inset-s-1/2 -translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2',
}

const POSITION_TRANSITION: Record<CompareSliderOrientation, string> = {
  horizontal: 'transition-[inset-inline-start]',
  vertical: 'transition-[top]',
}

const REVEAL_TIMING = 'duration-1000 ease-out motion-reduce:transition-none'

const PRESS_TIMING =
  'transition duration-250 ease-spring group-data-dragging/compare-slider:duration-100 group-data-dragging/compare-slider:ease-in-out motion-reduce:transition-none'

const LAYER_CLASSES = 'relative col-start-1 row-start-1 min-h-0 min-w-0 [&>img]:size-full [&>img]:object-cover'

const LABEL_CLASSES =
  'border-border bg-background text-foreground-intense absolute flex h-7 items-center rounded-full border px-3 text-sm whitespace-nowrap'

const LABEL_CORNER: Record<LabelCorner, string> = {
  'top-start': 'top-3 inset-s-3',
  'top-end': 'top-3 inset-e-3',
  'bottom-start': 'bottom-3 inset-s-3',
  'bottom-end': 'bottom-3 inset-e-3',
}

interface CompareSliderProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'children' | 'defaultValue' | 'onChange'
> {
  /** Layer on the start side of the divider, or above it when vertical. */
  before: React.ReactNode
  /** Layer on the end side of the divider, or below it when vertical. */
  after: React.ReactNode
  /** Divider position as a percentage of the way from the start edge (the top when vertical). Pass it to control the component. */
  value?: number
  /**
   * Divider position on first render, as a percentage of the way from the start edge, when the component is uncontrolled.
   * @default 50
   */
  defaultValue?: number
  /** Fires on every change, including each frame of a drag. */
  onValueChange?: (value: number) => void
  /** Fires once a drag ends or a key press settles, with the position landed on. */
  onValueCommitted?: (value: number) => void
  /**
   * Axis the divider travels along. Vertical stacks `before` above `after`.
   * @default 'horizontal'
   */
  orientation?: CompareSliderOrientation
  /** Caption in a corner of the `before` layer, clipped with it as the divider passes. */
  beforeLabel?: React.ReactNode
  /** Caption in a corner of the `after` layer, clipped with it as the divider passes. */
  afterLabel?: React.ReactNode
  /**
   * Edge the labels sit along. A vertical slider ignores it and puts each label at its own end.
   * @default 'bottom'
   */
  labelPosition?: CompareSliderLabelPosition
  /** Icon on the handle. Defaults to a double arrow that follows `orientation`. */
  icon?: React.ReactNode
  /**
   * Open on `before` alone and wipe the divider in to `defaultValue` the first time the slider scrolls into view. Uncontrolled only.
   * @default false
   */
  reveal?: boolean
  /**
   * Prevent moving the divider.
   * @default false
   */
  disabled?: boolean
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value))
}

/** Clips each layer to its side of the divider, so a transparent layer never shows the other through it. */
function layerClips(position: number, vertical: boolean, rtl: boolean): [before: string, after: string] {
  const rest = 100 - position
  if (vertical) return [`inset(0 0 ${rest}% 0)`, `inset(${position}% 0 0 0)`]
  return rtl
    ? [`inset(0 0 0 ${rest}%)`, `inset(0 ${position}% 0 0)`]
    : [`inset(0 ${rest}% 0 0)`, `inset(0 0 0 ${position}%)`]
}

function CompareSlider({
  before,
  after,
  value,
  defaultValue = 50,
  onValueChange,
  onValueCommitted,
  orientation = 'horizontal',
  beforeLabel,
  afterLabel,
  labelPosition = 'bottom',
  icon,
  reveal = false,
  disabled = false,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: CompareSliderProps) {
  const rtl = useDirection() === 'rtl'
  const vertical = orientation === 'vertical'
  const controlled = value !== undefined

  const rootRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const gestureRef = React.useRef<{ x: number; y: number; tracking: boolean } | null>(null)

  const [uncontrolled, setUncontrolled] = React.useState(() => clamp(defaultValue))
  const [seen, setSeen] = React.useState(!reveal)
  const [touched, setTouched] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)

  const position = controlled ? clamp(value) : reveal && !seen && !touched ? 100 : uncontrolled
  const revealing = reveal && !controlled && !touched

  const latestRef = React.useRef(position)
  latestRef.current = position

  React.useEffect(() => {
    if (!reveal || seen) return
    const node = rootRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true)
      },
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [reveal, seen])

  const update = (next: number) => {
    const clamped = clamp(next)
    setTouched(true)
    if (clamped === latestRef.current) return
    latestRef.current = clamped
    if (!controlled) setUncontrolled(clamped)
    onValueChange?.(clamped)
  }

  const placeAt = (clientX: number, clientY: number) => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect?.width || !rect.height) return
    const ratio = vertical ? (clientY - rect.top) / rect.height : (clientX - rect.left) / rect.width
    update((!vertical && rtl ? 1 - ratio : ratio) * 100)
  }

  const capture = (event: React.PointerEvent<HTMLDivElement>) => {
    try {
      // Capture last: it throws when the pointer is already gone, by which point the
      // press has been applied and a failure only costs tracking outside the element.
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {}
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return
    const mouse = event.pointerType === 'mouse'
    gestureRef.current = { x: event.clientX, y: event.clientY, tracking: mouse }
    setDragging(true)
    if (!mouse) return
    placeAt(event.clientX, event.clientY)
    inputRef.current?.focus({ preventScroll: true })
    capture(event)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    if (!gesture) return
    if (!gesture.tracking) {
      const dx = Math.abs(event.clientX - gesture.x)
      const dy = Math.abs(event.clientY - gesture.y)
      if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return
      if (vertical ? dx > dy : dy > dx) {
        gestureRef.current = null
        setDragging(false)
        return
      }
      gesture.tracking = true
      capture(event)
    }
    placeAt(event.clientX, event.clientY)
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    gestureRef.current = null
    if (!gesture) return
    setDragging(false)
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (!gesture.tracking) {
      if (event.type !== 'pointerup') return
      placeAt(event.clientX, event.clientY)
      inputRef.current?.focus({ preventScroll: true })
    }
    onValueCommitted?.(latestRef.current)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    const step = event.shiftKey ? PAGE_STEP : STEP
    const across = !vertical && rtl ? -1 : 1
    const deltas: Record<string, number | undefined> = {
      ArrowLeft: -across * step,
      ArrowRight: across * step,
      ArrowUp: vertical ? -step : step,
      ArrowDown: vertical ? step : -step,
      PageUp: vertical ? -PAGE_STEP : PAGE_STEP,
      PageDown: vertical ? PAGE_STEP : -PAGE_STEP,
    }
    const next =
      event.key === 'Home' ? 0 : event.key === 'End' ? 100 : latestRef.current + (deltas[event.key] ?? Number.NaN)
    if (Number.isNaN(next)) return
    event.preventDefault()
    update(next)
    onValueCommitted?.(latestRef.current)
  }

  const [beforeClip, afterClip] = layerClips(position, vertical, rtl)
  const offset = { [vertical ? 'top' : 'insetInlineStart']: `${position}%` }
  const positionTransition = revealing && cn(POSITION_TRANSITION[orientation], REVEAL_TIMING)
  const clipTransition = revealing && `transition-[clip-path] ${REVEAL_TIMING}`
  const beforeCorner: LabelCorner = vertical ? 'top-start' : `${labelPosition}-start`
  const afterCorner: LabelCorner = vertical ? 'bottom-start' : `${labelPosition}-end`

  return (
    <div
      ref={rootRef}
      data-base-ui-swipe-ignore={vertical ? 'y' : 'x'}
      {...props}
      data-slot="compare-slider"
      data-orientation={orientation}
      data-dragging={dragging ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      className={cn(
        'group/compare-slider relative isolate rounded-2xl select-none',
        disabled ? 'cursor-default' : ROOT_ORIENTATION[orientation],
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        data-slot="compare-slider-viewport"
        className="bg-background-muted pointer-events-none grid size-full overflow-hidden rounded-[inherit]"
      >
        <div
          data-slot="compare-slider-before"
          className={cn(LAYER_CLASSES, clipTransition)}
          style={{ clipPath: beforeClip }}
        >
          {before}
          {beforeLabel ? (
            <span data-slot="compare-slider-label" className={cn(LABEL_CLASSES, LABEL_CORNER[beforeCorner])}>
              {beforeLabel}
            </span>
          ) : null}
        </div>
        <div
          data-slot="compare-slider-after"
          className={cn(LAYER_CLASSES, clipTransition)}
          style={{ clipPath: afterClip }}
        >
          {after}
          {afterLabel ? (
            <span data-slot="compare-slider-label" className={cn(LABEL_CLASSES, LABEL_CORNER[afterCorner])}>
              {afterLabel}
            </span>
          ) : null}
        </div>
        <div
          data-slot="compare-slider-divider"
          aria-hidden="true"
          className={cn(
            'light absolute bg-white shadow-md shadow-black/20',
            DIVIDER_ORIENTATION[orientation],
            positionTransition,
          )}
          style={offset}
        />
      </div>

      <input
        ref={inputRef}
        type="range"
        className="sr-only"
        min={0}
        max={100}
        value={Math.round(position)}
        disabled={disabled}
        aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? 'Divider position')}
        aria-labelledby={ariaLabelledBy}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        onChange={(event) => update(Number(event.target.value))}
      />

      <span
        data-slot="compare-slider-handle"
        aria-hidden="true"
        className={cn(
          'light bg-background text-foreground-intense outline-ring pointer-events-none absolute grid size-11 place-items-center rounded-full shadow-lg shadow-black/25',
          "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
          'group-has-focus-visible/compare-slider:outline-2 group-has-focus-visible/compare-slider:outline-offset-2',
          'group-data-disabled/compare-slider:bg-background/60 group-data-disabled/compare-slider:*:opacity-disabled group-data-disabled/compare-slider:shadow-none group-data-disabled/compare-slider:backdrop-blur-md',
          'transform-gpu group-data-dragging/compare-slider:translate-y-[calc(-50%+1px)] group-data-dragging/compare-slider:scale-[0.97]',
          HANDLE_ORIENTATION[orientation],
          revealing ? positionTransition : PRESS_TIMING,
        )}
        style={offset}
      >
        {icon ?? (vertical ? <ArrowsVerticalIcon /> : <ArrowsHorizontalIcon />)}
      </span>
    </div>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function ArrowsHorizontalIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m7 8-4 4m0 0 4 4m-4-4h18m-4-4 4 4m0 0-4 4" />
    </svg>
  )
}

function ArrowsVerticalIcon(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m8 7 4-4m0 0 4 4m-4-4v18m-4-4 4 4m0 0 4-4" />
    </svg>
  )
}

export { CompareSlider }
export type { CompareSliderProps }
