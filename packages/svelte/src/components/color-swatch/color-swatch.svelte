<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Color } from '../../lib/color'
  import type { ColorSwatchPresetSize, ColorSwatchShape } from './color-swatch-variants'

  export type ColorSwatchProps = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & {
    /**
     * Color to show. Pass a `Color` or any CSS color string. Inside a `ColorPicker` it
     * can be left off, and the swatch previews whatever the picker currently holds.
     */
    color?: Color | string
    /**
     * Name announced for the color, in place of the description built from the color
     * itself. Use it for the name your palette gives the color, e.g. `'Fire truck red'`.
     */
    colorName?: string
    /**
     * Rounded square or full circle.
     * @default 'rounded'
     */
    shape?: ColorSwatchShape
    /**
     * A preset scale, or a pixel number for an exact size.
     * @default 'md'
     */
    size?: ColorSwatchPresetSize | number
    /**
     * Back a translucent color with a checkerboard, so it reads as translucent rather
     * than as the flat color it composites to. Turn it off to let the swatch blend into
     * whatever sits behind it. An opaque color covers it either way.
     * @default true
     */
    checkerboard?: boolean
    /**
     * Dim the swatch and swap the color for a flat muted fill.
     * @default false
     */
    disabled?: boolean
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import {
    colorControlCheckerboard,
    colorControlSurfaceClasses,
    describeColor,
    normalizeColor,
  } from '../../internal/color-control'
  import { getColorPickerContext } from '../../internal/color-picker-context.svelte'
  import { formatColor } from '../../lib/color'
  import { colorSwatchVariants } from './color-swatch-variants'

  const CHECKERBOARD_SIZE = '0.3em 0.3em'

  let {
    color,
    colorName,
    shape = 'rounded',
    size = 'md',
    checkerboard = true,
    disabled: disabledProp,
    class: className,
    style,
    children,
    'aria-label': ariaLabel,
    ...rest
  }: ColorSwatchProps & { children?: Snippet } = $props()

  const picker = getColorPickerContext()
  const resolved = $derived.by(() => {
    const next = color === undefined ? picker?.value : normalizeColor(color)
    if (!next) throw new Error('Appica UI: <ColorSwatch> needs a `color`, or a <ColorPicker> to take one from.')
    return next
  })

  const disabled = $derived(Boolean(disabledProp) || (picker?.disabled ?? false))
  const isNumeric = $derived(typeof size === 'number')
  const checkered = $derived(checkerboard && resolved.alpha < 1)
  const css = $derived(formatColor(resolved))
  const presetSize = $derived(typeof size === 'number' ? undefined : size)
  const classes = $derived(cn(colorSwatchVariants({ shape, size: presetSize }), className))
  const announced = $derived([colorName ?? describeColor(resolved), ariaLabel].filter(Boolean).join(', '))
</script>

<span
  role="img"
  aria-label={announced}
  data-slot="color-swatch"
  data-disabled={disabled ? '' : undefined}
  class={classes}
  style:font-size={isNumeric ? `${size}px` : undefined}
  style:background-color={!disabled && !checkered ? css : undefined}
  style:background-image={!disabled && checkered ? `linear-gradient(${css}, ${css}), ${colorControlCheckerboard}` : undefined}
  style:background-size={!disabled && checkered ? `auto, ${CHECKERBOARD_SIZE}` : undefined}
  {style}
  {...rest}
>
  <span data-slot="color-swatch-surface" aria-hidden="true" class={colorControlSurfaceClasses}></span>
  {@render children?.()}
</span>
