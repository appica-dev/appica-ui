'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import { COLOR_SWATCH_SHAPES, COLOR_SWATCH_SIZES, describeColor, normalizeColor } from '../../internal/color-control'
import { useColorPickerContext } from '../../internal/color-picker-context'
import { ColorSwatch } from '../color-swatch/color-swatch'
import { type Color, formatColor } from '../../lib/color'

const ITEM = '[data-slot=color-swatch-picker-item]'

type ColorSwatchPickerLayout = 'grid' | 'stack'

const pickerVariants = cva('relative isolate flex gap-1', {
  variants: {
    size: COLOR_SWATCH_SIZES,
    layout: {
      grid: 'flex-row flex-wrap',
      stack: 'flex-col',
    },
  },
})

// The button is the outer ring's box, so the swatch has to sit inside it. At 0.8em
// the gap either side is 0.1em, which holds at every size because both are ems.
const itemVariants = cva(
  'outline-ring relative flex size-[1em] shrink-0 transform-gpu cursor-pointer items-center justify-center focus-visible:outline-3 motion-safe:transition motion-safe:duration-250 motion-safe:ease-spring motion-safe:active:translate-y-px motion-safe:active:scale-90 motion-safe:active:duration-100 motion-safe:active:ease-in-out data-disabled:pointer-events-none data-disabled:cursor-default',
  { variants: { shape: COLOR_SWATCH_SHAPES } },
)

type ColorSwatchPickerSize = NonNullable<VariantProps<typeof pickerVariants>['size']>
type ColorSwatchPickerShape = NonNullable<VariantProps<typeof itemVariants>['shape']>

interface ColorSwatchPickerContextValue {
  colors: Map<string, Color>
  selectedKey: string | null
  select: (color: Color) => void
  shape: ColorSwatchPickerShape
  disabled: boolean
}

const ColorSwatchPickerContext = React.createContext<ColorSwatchPickerContextValue | null>(null)

function usePickerContext() {
  const context = React.useContext(ColorSwatchPickerContext)
  if (!context) throw new Error('Appica UI: <ColorSwatchPickerItem> must be used within <ColorSwatchPicker>.')
  return context
}

/** Where the indicator sits, in the picker's own coordinates. */
interface Indicator {
  x: number
  y: number
  width: number
  height: number
}

function sameBox(a: Indicator | null, b: Indicator) {
  return a != null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
}

/**
 * The item one row up or down in a wrapped grid, nearest the column the focus is
 * already in. Rows are whatever shares an `offsetTop`, since the wrapping is the
 * browser's to decide.
 */
function rowNeighbor(items: HTMLElement[], from: number, step: 1 | -1) {
  const origin = items[from]!
  const beyond = items.filter((item) =>
    step > 0 ? item.offsetTop > origin.offsetTop : item.offsetTop < origin.offsetTop,
  )
  if (beyond.length === 0) return from + step

  const tops = beyond.map((item) => item.offsetTop)
  const row = step > 0 ? Math.min(...tops) : Math.max(...tops)
  const nearest = beyond
    .filter((item) => item.offsetTop === row)
    .reduce((best, item) =>
      Math.abs(item.offsetLeft - origin.offsetLeft) < Math.abs(best.offsetLeft - origin.offsetLeft) ? item : best,
    )
  return items.indexOf(nearest)
}

interface ColorSwatchPickerProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'color' | 'defaultValue' | 'onChange'
> {
  /**
   * Selected color. Pass a `Color` or any CSS color string to control the component.
   * Inside a `ColorPicker` it can be left off: the control then reads and writes the
   * picker's color.
   */
  value?: Color | string
  /** Color selected before any interaction, when the component is uncontrolled. */
  defaultValue?: Color | string
  /** Fires with the color that was picked. */
  onValueChange?: (value: Color) => void
  /**
   * Wrapping rows of swatches, or a single column.
   * @default 'grid'
   */
  layout?: ColorSwatchPickerLayout
  /**
   * A preset scale, or a pixel number for an exact size. Sizes the button; the swatch
   * inside is smaller, so the selected ring has somewhere to sit.
   * @default 'md'
   */
  size?: ColorSwatchPickerSize | number
  /**
   * Rounded square or full circle, applied to every swatch and to the ring.
   * @default 'rounded'
   */
  shape?: ColorSwatchPickerShape
  /**
   * Prevent interaction and swap every color for a flat muted fill.
   * @default false
   */
  disabled?: boolean
}

function ColorSwatchPicker({
  value,
  defaultValue,
  onValueChange,
  layout = 'grid',
  size = 'md',
  shape = 'rounded',
  disabled: disabledProp,
  className,
  style,
  children,
  ...props
}: ColorSwatchPickerProps) {
  const mirrored = useDirection() === 'rtl'
  const rootRef = React.useRef<HTMLDivElement>(null)
  const colors = React.useMemo(() => new Map<string, Color>(), [])
  const picker = useColorPickerContext()

  const [uncontrolled, setUncontrolled] = React.useState<Color | null>(() =>
    defaultValue === undefined ? null : normalizeColor(defaultValue),
  )
  const [indicator, setIndicator] = React.useState<Indicator | null>(null)

  const disabled = disabledProp || (picker?.disabled ?? false)
  const resolved = value !== undefined ? normalizeColor(value) : (picker?.value ?? uncontrolled)
  // Keyed on hexa like React Aria, so the same color written two ways is one entry.
  const selectedKey = resolved === null ? null : formatColor(resolved, 'hexa')

  const select = (color: Color) => {
    if (value === undefined && !picker) setUncontrolled(color)
    picker?.setValue(color)
    picker?.commitValue(color)
    onValueChange?.(color)
  }

  // No dependency list: this mirrors the rendered DOM back into the roving tab stop
  // and the indicator's box, both of which any render can invalidate.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const sync = () => {
      const items = Array.from(root.querySelectorAll<HTMLElement>(ITEM))
      const selected = items.find((item) => item.getAttribute('aria-selected') === 'true')
      const reachable = selected ?? items.find((item) => !item.hasAttribute('data-disabled'))
      for (const item of items) item.tabIndex = item === reachable ? 0 : -1

      if (!selected) return setIndicator(null)
      const box = {
        x: selected.offsetLeft,
        y: selected.offsetTop,
        width: selected.offsetWidth,
        height: selected.offsetHeight,
      }
      setIndicator((previous) => (sameBox(previous, box) ? previous : box))
    }

    sync()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(sync)
    observer.observe(root)
    return () => observer.disconnect()
  })

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const root = rootRef.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>(`${ITEM}:not([data-disabled])`))
    const current = items.indexOf(document.activeElement as HTMLElement)
    if (current < 0) return

    const stack = layout === 'stack'
    const forward = mirrored ? 'ArrowLeft' : 'ArrowRight'
    const backward = mirrored ? 'ArrowRight' : 'ArrowLeft'

    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : event.key === forward
            ? current + 1
            : event.key === backward
              ? current - 1
              : event.key === 'ArrowDown'
                ? stack
                  ? current + 1
                  : rowNeighbor(items, current, 1)
                : event.key === 'ArrowUp'
                  ? stack
                    ? current - 1
                    : rowNeighbor(items, current, -1)
                  : NaN
    if (Number.isNaN(next)) return

    event.preventDefault()
    const target = items[(next + items.length) % items.length]
    if (!target) return
    target.focus()
    // Selection follows focus, which is what a single-select listbox is expected to
    // do and what makes arrowing through a palette worth doing at all.
    const color = colors.get(target.dataset.value ?? '')
    if (color) select(color)
  }

  const isNumeric = typeof size === 'number'
  const context: ColorSwatchPickerContextValue = { colors, selectedKey, select, shape, disabled }

  return (
    <ColorSwatchPickerContext.Provider value={context}>
      <div
        ref={rootRef}
        role="listbox"
        aria-orientation={layout === 'stack' ? 'vertical' : 'horizontal'}
        {...props}
        data-slot="color-swatch-picker"
        data-layout={layout}
        {...(disabled ? { 'data-disabled': '' } : {})}
        className={cn(pickerVariants({ layout, size: isNumeric ? undefined : size }), className)}
        style={{ ...(isNumeric ? { fontSize: `${size}px` } : undefined), ...style }}
        onKeyDown={handleKeyDown}
      >
        {children}

        {indicator && (
          <span
            aria-hidden="true"
            data-slot="color-swatch-picker-indicator"
            className={cn(
              'border-border-inverse pointer-events-none absolute top-0 left-0 z-10 border',
              COLOR_SWATCH_SHAPES[shape],
              'motion-safe:transition-[translate,width,height] motion-safe:duration-250',
            )}
            style={{
              translate: `${indicator.x}px ${indicator.y}px`,
              width: indicator.width,
              height: indicator.height,
            }}
          />
        )}
      </div>
    </ColorSwatchPickerContext.Provider>
  )
}

interface ColorSwatchPickerItemProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color' | 'value'> {
  /** Color this swatch offers. Pass a `Color` or any CSS color string. */
  color: Color | string
  /** Name announced for the color, in place of the description built from the color itself. */
  colorName?: string
  /**
   * Prevent this swatch from being picked, and swap its color for a flat muted fill.
   * @default false
   */
  disabled?: boolean
}

function ColorSwatchPickerItem({
  color,
  colorName,
  disabled = false,
  className,
  children,
  ...props
}: ColorSwatchPickerItemProps) {
  const { colors, selectedKey, select, shape, disabled: pickerDisabled } = usePickerContext()

  const resolved = React.useMemo(() => normalizeColor(color), [color])
  const key = formatColor(resolved, 'hexa')
  const selected = selectedKey === key
  const off = disabled || pickerDisabled

  React.useEffect(() => {
    colors.set(key, resolved)
    return () => {
      colors.delete(key)
    }
  }, [colors, key, resolved])

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-label={colorName ?? describeColor(resolved)}
      {...props}
      data-slot="color-swatch-picker-item"
      data-value={key}
      {...(off ? { 'data-disabled': '', disabled: true } : {})}
      tabIndex={-1}
      className={cn(itemVariants({ shape }), className)}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) select(resolved)
      }}
    >
      {/* The button carries the name, so a second one on the swatch would double it. */}
      <ColorSwatch aria-hidden="true" color={resolved} shape={shape} disabled={off} className="text-[0.8em]" />
      {children}
    </button>
  )
}

export { ColorSwatchPicker, ColorSwatchPickerItem }
export type { ColorSwatchPickerProps, ColorSwatchPickerItemProps }
