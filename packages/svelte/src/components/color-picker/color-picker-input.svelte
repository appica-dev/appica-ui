<script lang="ts" module>
  import type { Snippet } from 'svelte'
  import type { ColorFormat } from '../../lib/color'
  import type { HTMLInputAttributes } from 'svelte/elements'
  import type { VariantProps } from 'class-variance-authority'
  import { inputVariants } from '../input/input-variants'

  type InputVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
  type InputSize = NonNullable<VariantProps<typeof inputVariants>['size']>

  export type ColorPickerInputProps = Omit<
    HTMLInputAttributes,
    'value' | 'defaultValue' | 'color' | 'size'
  > & {
    /** Format the color is written in. Defaults to the enclosing picker's `format`. */
    format?: ColorFormat
    /**
     * Field appearance - bordered or filled.
     * @default 'outline'
     */
    variant?: InputVariant
    /**
     * Scales height, padding, and text. Named `inputSize` to avoid the native `size` attribute.
     * @default 'sm'
     */
    inputSize?: InputSize
    /** Adornment rendered before the field, inside the frame. */
    start?: Snippet
    /** Adornment rendered after the field, inside the frame. */
    end?: Snippet
  }
</script>

<script lang="ts">
  import Input from '../input/input.svelte'
  import { cn } from '../../internal/utils'
  import { requireColorPickerContext } from '../../internal/color-picker-context.svelte'
  import { type Color, formatColor, safeParseColor } from '../../lib/color'

  const FORMAT_LABELS: Record<ColorFormat, string> = {
    hex: 'Hex',
    hexa: 'Hex',
    rgb: 'RGB',
    rgba: 'RGB',
    hsl: 'HSL',
    hsla: 'HSL',
    hsb: 'HSB',
    hsba: 'HSB',
    oklch: 'OKLCH',
    oklcha: 'OKLCH',
  }

  const OPAQUE_FORMATS: Partial<Record<ColorFormat, ColorFormat>> = {
    hexa: 'hex',
    rgba: 'rgb',
    hsla: 'hsl',
    hsba: 'hsb',
    oklcha: 'oklch',
  }

  function displayFormat(format: ColorFormat, color: Color): ColorFormat {
    return color.alpha < 1 ? format : (OPAQUE_FORMATS[format] ?? format)
  }

  function parseInputColor(text: string): Color | undefined {
    const trimmed = text.trim()
    return safeParseColor(/^[0-9a-f]{3,8}$/i.test(trimmed) ? `#${trimmed}` : trimmed)
  }

  let {
    format: formatProp,
    variant = 'outline',
    inputSize = 'sm',
    start,
    end,
    class: className,
    disabled,
    onblur,
    onkeydown,
    ...rest
  }: ColorPickerInputProps = $props()

  const picker = requireColorPickerContext('ColorPickerInput')
  const format = $derived(formatProp ?? picker.format)
  let draft = $state<string | null>(null)
  const displayed = $derived(draft ?? formatColor(picker.value, displayFormat(format, picker.value)))

  function commit() {
    const parsed = draft === null ? undefined : parseInputColor(draft)
    if (parsed) picker.commitValue(parsed)
    draft = null
  }

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    const next = event.currentTarget.value
    draft = next
    const parsed = parseInputColor(next)
    if (parsed) picker.setValue(parsed)
  }

  function handleBlur(event: FocusEvent & { currentTarget: HTMLInputElement }) {
    onblur?.(event)
    commit()
  }

  function handleKeyDown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
    onkeydown?.(event)
    if (event.defaultPrevented) return
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
    } else if (event.key === 'Escape') {
      draft = null
    }
  }
</script>

<Input
  {...rest}
  {variant}
  {inputSize}
  {start}
  {end}
  spellcheck={false}
  autocomplete="off"
  autocorrect="off"
  autocapitalize="off"
  aria-label={FORMAT_LABELS[format]}
  data-slot="color-picker-input"
  disabled={disabled ?? picker.disabled}
  value={displayed}
  class={cn('font-mono', className)}
  oninput={handleInput}
  onblur={handleBlur}
  onkeydown={handleKeyDown}
  htmlSize={1}
/>
