<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Color } from '../../lib/color'
  import type {
    ColorSwatchPickerLayout,
    ColorSwatchPickerShape,
    ColorSwatchPickerSize,
  } from './color-swatch-picker-variants'

  export type { ColorSwatchPickerLayout, ColorSwatchPickerShape, ColorSwatchPickerSize }

  export type ColorSwatchPickerProps = Omit<HTMLAttributes<HTMLDivElement>, 'color'> & {
    /**
     * Selected color. Pass a `Color` or any CSS color string to control the component.
     * Pair with `onValueChange` or `bind:value`. Inside a `ColorPicker` it can be left
     * off: the control then reads and writes the picker's color.
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

  export interface Indicator {
    x: number
    y: number
    width: number
    height: number
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { cn, commitBindableChange } from '../../internal/utils'
  import { useDirection } from '../../hooks/use-direction/use-direction'
  import { COLOR_SWATCH_SHAPES, normalizeColor } from '../../internal/color-control'
  import { getColorPickerContext } from '../../internal/color-picker-context.svelte'
  import { formatColor } from '../../lib/color'
  import { setColorSwatchPickerContext } from './color-swatch-picker-context'
  import { colorSwatchPickerVariants } from './color-swatch-picker-variants'

  const ITEM = '[data-slot=color-swatch-picker-item]'

  function sameBox(a: Indicator | null, b: Indicator) {
    return a != null && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  }

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

  let {
    value = $bindable(),
    defaultValue,
    onValueChange,
    layout = 'grid',
    size = 'md',
    shape = 'rounded',
    disabled: disabledProp,
    class: className,
    style,
    children,
    ...rest
  }: ColorSwatchPickerProps & { children?: Snippet } = $props()

  const direction = useDirection()
  const picker = getColorPickerContext()
  const colors = new Map<string, Color>()

  let uncontrolled = $state<Color | null>(null)
  uncontrolled = untrack(() => (defaultValue === undefined ? null : normalizeColor(defaultValue)))

  let rootEl: HTMLDivElement | undefined = $state()
  let indicator = $state<Indicator | null>(null)

  const mirrored = $derived(direction.current === 'rtl')
  const disabled = $derived(Boolean(disabledProp) || (picker?.disabled ?? false))
  const resolved = $derived(
    value !== undefined ? normalizeColor(value) : (picker?.value ?? uncontrolled),
  )
  const selectedKey = $derived(resolved === null ? null : formatColor(resolved, 'hexa'))
  const isNumeric = $derived(typeof size === 'number')
  const presetSize = $derived(typeof size === 'number' ? undefined : size)
  const classes = $derived(
    cn(colorSwatchPickerVariants({ layout, size: presetSize }), className),
  )

  function select(color: Color) {
    picker?.setValue(color)
    picker?.commitValue(color)
    commitBindableChange({
      next: color,
      bound: value === undefined ? undefined : resolved === null ? undefined : resolved,
      setBound: (next) => {
        value = next
      },
      setInner: (next) => {
        uncontrolled = next
      },
      onChange: onValueChange,
    })
  }

  setColorSwatchPickerContext({
    colors,
    get selectedKey() {
      return selectedKey
    },
    select,
    get shape() {
      return shape
    },
    get disabled() {
      return disabled
    },
  })

  $effect(() => {
    void selectedKey
    void layout
    const root = rootEl
    if (!root) return

    const sync = () => {
      const items = Array.from(root.querySelectorAll<HTMLElement>(ITEM))
      const selected = items.find((item) => item.getAttribute('aria-selected') === 'true')
      const reachable = selected ?? items.find((item) => !item.hasAttribute('data-disabled'))
      for (const item of items) item.tabIndex = item === reachable ? 0 : -1

      if (!selected) {
        indicator = null
        return
      }
      const box = {
        x: selected.offsetLeft,
        y: selected.offsetTop,
        width: selected.offsetWidth,
        height: selected.offsetHeight,
      }
      indicator = sameBox(indicator, box) ? indicator : box
    }

    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(root)
    return () => observer.disconnect()
  })

  function handleKeyDown(event: KeyboardEvent) {
    const root = rootEl
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
    const color = colors.get(target.dataset.value ?? '')
    if (color) select(color)
  }
</script>

<div
  bind:this={rootEl}
  role="listbox"
  aria-orientation={layout === 'stack' ? 'vertical' : 'horizontal'}
  data-slot="color-swatch-picker"
  data-layout={layout}
  data-disabled={disabled ? '' : undefined}
  class={classes}
  style:font-size={isNumeric ? `${size}px` : undefined}
  {style}
  onkeydown={handleKeyDown}
  {...rest}
>
  {@render children?.()}

  {#if indicator}
    <span
      aria-hidden="true"
      data-slot="color-swatch-picker-indicator"
      class={cn(
        'border-border-inverse pointer-events-none absolute top-0 left-0 z-10 border',
        COLOR_SWATCH_SHAPES[shape],
        'motion-safe:transition-[translate,width,height] motion-safe:duration-250',
      )}
      style:translate={`${indicator.x}px ${indicator.y}px`}
      style:width={`${indicator.width}px`}
      style:height={`${indicator.height}px`}
    ></span>
  {/if}
</div>
