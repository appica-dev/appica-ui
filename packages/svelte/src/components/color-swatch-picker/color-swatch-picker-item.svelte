<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Color } from '../../lib/color'

  export type ColorSwatchPickerItemProps = Omit<HTMLButtonAttributes, 'color' | 'value'> & {
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
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { describeColor, normalizeColor } from '../../internal/color-control'
  import { formatColor } from '../../lib/color'
  import ColorSwatch from '../color-swatch/color-swatch.svelte'
  import { getColorSwatchPickerContext } from './color-swatch-picker-context'
  import { colorSwatchPickerItemVariants } from './color-swatch-picker-variants'

  let {
    color,
    colorName,
    disabled = false,
    class: className,
    children,
    onclick,
    ...rest
  }: ColorSwatchPickerItemProps & { children?: Snippet } = $props()

  const ctx = getColorSwatchPickerContext()
  const resolved = $derived(normalizeColor(color))
  const key = $derived(formatColor(resolved, 'hexa'))
  const selected = $derived(ctx.selectedKey === key)
  const off = $derived(disabled || ctx.disabled)
  const classes = $derived(cn(colorSwatchPickerItemVariants({ shape: ctx.shape }), className))

  $effect(() => {
    ctx.colors.set(key, resolved)
    return () => {
      ctx.colors.delete(key)
    }
  })

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(event)
    if (!event.defaultPrevented) ctx.select(resolved)
  }
</script>

<button
  type="button"
  role="option"
  aria-selected={selected}
  aria-label={colorName ?? describeColor(resolved)}
  data-slot="color-swatch-picker-item"
  data-value={key}
  data-disabled={off ? '' : undefined}
  disabled={off}
  tabindex={-1}
  class={classes}
  onclick={handleClick}
  {...rest}
>
  <ColorSwatch aria-hidden="true" color={resolved} shape={ctx.shape} disabled={off} class="text-[0.8em]" />
  {@render children?.()}
</button>
