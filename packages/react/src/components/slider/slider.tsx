'use client'

import * as React from 'react'
import { Slider as BaseSlider } from '@base-ui/react/slider'
import { AnimatePresence, LazyMotion, domAnimation, m, useAnimate } from 'motion/react'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import { useReducedMotion } from '../../hooks/use-reduced-motion'

type SliderTooltipVisibility = 'always' | 'auto' | 'never'

type AnimDirection = 'up' | 'down'

const TOOLTIP_TILT_DEG = 8
const TOOLTIP_TILT_TRANSITION = {
  duration: 0.4,
  ease: [0.34, 1.56, 0.64, 1] satisfies [number, number, number, number],
}

const TOOLTIP_POPUP_TRANSITION = {
  duration: 0.2,
  // `--ease-spring` in styles.css, as numbers: Motion can't read a CSS variable.
  ease: [0.175, 0.885, 0.32, 1.5] satisfies [number, number, number, number],
}

const tooltipWrapperClasses =
  'absolute z-10 pointer-events-none transition-transform duration-250 group-hover:scale-110 group-focus-within:scale-110 motion-reduce:transition-none data-[orientation=horizontal]:bottom-full data-[orientation=horizontal]:left-1/2 data-[orientation=horizontal]:-translate-x-1/2 data-[orientation=horizontal]:mb-1 data-[orientation=horizontal]:origin-bottom data-[orientation=vertical]:top-1/2 data-[orientation=vertical]:-translate-y-1/2 data-[orientation=vertical]:inset-s-full data-[orientation=vertical]:ms-1 data-[orientation=vertical]:ltr:origin-left data-[orientation=vertical]:rtl:origin-right'

const tooltipInnerClasses =
  'bg-background-inverse text-foreground-inverse rounded-4xs block px-1 py-0.5 text-xs leading-none whitespace-nowrap data-[orientation=horizontal]:origin-bottom data-[orientation=vertical]:ltr:origin-left data-[orientation=vertical]:rtl:origin-right'

interface SliderTooltipProps {
  index: number
  visibility: 'always' | 'auto'
  orientation: 'horizontal' | 'vertical'
  changeVersion: number
  direction: AnimDirection
  dirSign: 1 | -1
  reduced: boolean
  open: boolean
}

function SliderTooltip({
  index,
  visibility,
  orientation,
  changeVersion,
  direction,
  dirSign,
  reduced,
  open,
}: SliderTooltipProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>()

  React.useEffect(() => {
    if (reduced || changeVersion === 0 || !scope.current) return
    const sign = direction === 'up' ? 1 : -1
    const tilt = -sign * dirSign * TOOLTIP_TILT_DEG
    animate(scope.current, { rotate: [tilt, 0] }, TOOLTIP_TILT_TRANSITION)
  }, [changeVersion, direction, dirSign, reduced, animate, scope])

  const visible = visibility === 'always' || open

  return (
    <span data-slot="slider-tooltip-wrapper" data-orientation={orientation} className={tooltipWrapperClasses}>
      <AnimatePresence>
        {visible && (
          <m.div
            ref={scope}
            data-slot="slider-tooltip"
            data-orientation={orientation}
            aria-hidden="true"
            className={tooltipInnerClasses}
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={reduced ? { duration: 0 } : TOOLTIP_POPUP_TRANSITION}
          >
            <BaseSlider.Value>
              {(formattedValues) => <span className="leading-none">{formattedValues?.[index] ?? ''}</span>}
            </BaseSlider.Value>
          </m.div>
        )}
      </AnimatePresence>
    </span>
  )
}

const thumbClasses =
  'group relative block size-3 shrink-0 cursor-default rounded-full select-none disabled:pointer-events-none disabled:opacity-disabled'

const thumbVisualClasses =
  'bg-background border-primary relative block size-full rounded-full border-2 shadow-xs transition-transform duration-250 group-hover:scale-125 group-focus-within:scale-125 motion-reduce:transition-none'

interface SliderThumbProps {
  index: number
  ariaLabel?: string
  tooltipVisibility: SliderTooltipVisibility
  orientation: 'horizontal' | 'vertical'
  changeVersion: number
  direction: AnimDirection
  dirSign: 1 | -1
  reduced: boolean
}

function SliderThumb({
  index,
  ariaLabel,
  tooltipVisibility,
  orientation,
  changeVersion,
  direction,
  dirSign,
  reduced,
}: SliderThumbProps) {
  const [hovered, setHovered] = React.useState(false)
  const [focused, setFocused] = React.useState(false)

  const autoOpen = tooltipVisibility === 'auto' && (hovered || focused)

  const eventHandlers =
    tooltipVisibility === 'auto'
      ? {
          onPointerEnter: () => setHovered(true),
          onPointerLeave: () => setHovered(false),
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
        }
      : {}

  return (
    <BaseSlider.Thumb
      index={index}
      aria-label={ariaLabel}
      data-slot="slider-thumb"
      className={thumbClasses}
      {...eventHandlers}
    >
      <span data-slot="slider-thumb-visual" className={thumbVisualClasses} />
      {tooltipVisibility !== 'never' && (
        <SliderTooltip
          index={index}
          visibility={tooltipVisibility}
          orientation={orientation}
          changeVersion={changeVersion}
          direction={direction}
          dirSign={dirSign}
          reduced={reduced}
          open={autoOpen}
        />
      )}
    </BaseSlider.Thumb>
  )
}

const rootClasses =
  'data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-fit'

const controlClasses =
  'relative flex w-full touch-none items-center select-none data-disabled:opacity-disabled data-disabled:pointer-events-none data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col'

const trackClasses =
  'relative grow overflow-hidden rounded-full bg-background-strong select-none data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'

const indicatorClasses =
  'bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'

interface SliderProps extends Omit<BaseSlider.Root.Props, 'children'> {
  /**
   * When the value tooltip shows - on interaction, always, or never.
   * @default 'auto'
   */
  tooltipVisibility?: SliderTooltipVisibility
  /** Accessible name for each thumb. Use a function to name range ends. */
  thumbAriaLabel?: string | ((index: number) => string)
}

function toArray(value: number | readonly number[] | undefined): number[] {
  if (value == null) return []
  return Array.isArray(value) ? [...value] : [value as number]
}

function Slider({
  tooltipVisibility = 'auto',
  thumbAriaLabel,
  className,
  value,
  defaultValue,
  orientation = 'horizontal',
  onValueChange,
  ...rootProps
}: SliderProps) {
  const direction = useDirection()
  const dirSign: 1 | -1 = direction === 'rtl' ? -1 : 1
  const reduced = useReducedMotion()

  const seed = value ?? defaultValue
  const thumbCount = Array.isArray(seed) ? seed.length : 1

  const trackTooltips = tooltipVisibility !== 'never'

  const prevValuesRef = React.useRef<number[]>(toArray(seed))
  const [tilts, setTilts] = React.useState<Array<{ direction: AnimDirection; version: number }>>(() =>
    Array.from({ length: thumbCount }, () => ({ direction: 'up', version: 0 })),
  )

  const handleValueChange: NonNullable<typeof onValueChange> = (next, details) => {
    if (trackTooltips) {
      const nextArr = toArray(next)
      const prevArr = prevValuesRef.current
      prevValuesRef.current = nextArr
      setTilts((prev) => {
        let changed = false
        const updated = nextArr.map((_, i) => {
          const existing = prev[i] ?? { direction: 'up' as AnimDirection, version: 0 }
          const p = prevArr[i] ?? 0
          const c = nextArr[i] ?? p
          if (c === p) return existing
          changed = true
          return { direction: (c > p ? 'up' : 'down') as AnimDirection, version: existing.version + 1 }
        })
        return changed || updated.length !== prev.length ? updated : prev
      })
    }
    onValueChange?.(next, details)
  }

  const resolveAriaLabel = (index: number): string | undefined => {
    if (typeof thumbAriaLabel === 'function') return thumbAriaLabel(index)
    return thumbAriaLabel
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <BaseSlider.Root
        data-slot="slider"
        orientation={orientation}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        className={cn(rootClasses, className)}
        {...rootProps}
      >
        <BaseSlider.Control data-slot="slider-control" data-base-ui-swipe-ignore="" className={controlClasses}>
          <BaseSlider.Track data-slot="slider-track" className={trackClasses}>
            <BaseSlider.Indicator data-slot="slider-indicator" className={indicatorClasses} />
          </BaseSlider.Track>
          {Array.from({ length: thumbCount }).map((_, i) => (
            <SliderThumb
              key={i}
              index={i}
              ariaLabel={resolveAriaLabel(i)}
              tooltipVisibility={tooltipVisibility}
              orientation={orientation}
              changeVersion={tilts[i]?.version ?? 0}
              direction={tilts[i]?.direction ?? 'up'}
              dirSign={dirSign}
              reduced={reduced}
            />
          ))}
        </BaseSlider.Control>
      </BaseSlider.Root>
    </LazyMotion>
  )
}

export { Slider }
export type { SliderProps, SliderTooltipVisibility }
