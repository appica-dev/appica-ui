<script lang="ts" module>
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Color, ColorFormat } from '../../lib/color'
  import type { ColorSwatchShape } from '../color-swatch/color-swatch-variants'

  export type ColorPickerSize = 'sm' | 'md' | 'lg'
  export type ColorPickerVariant = 'ghost' | 'outline' | 'soft' | 'flush'
  export type ColorPickerSwatchPosition = 'start' | 'end'

  export type ColorPickerPopoverProps = {
    class?: string
    keepMounted?: boolean
    side?: 'top' | 'bottom' | 'left' | 'right'
    align?: 'start' | 'center' | 'end'
    sideOffset?: number
    /** Element or selector the panel anchors to when there is no trigger. */
    customAnchor?: string | HTMLElement | null
    /**
     * Trap focus inside the panel while open.
     * @default true
     */
    trapFocus?: boolean
    /** Fires when the panel takes focus on open. Call `preventDefault()` to leave focus where it is. */
    onOpenAutoFocus?: (event: Event) => void
    /** Fires when the panel returns focus on close. Call `preventDefault()` to leave focus where it is. */
    onCloseAutoFocus?: (event: Event) => void
    /** Fires on a press outside the panel. Call `preventDefault()` to keep it open. */
    onInteractOutside?: (event: Event) => void
    [key: string]: unknown
  }

  export type ColorPickerProps = Omit<HTMLAttributes<HTMLElement>, 'color'> & {
    /** Selected color. Pass a `Color` or any CSS color string to control the component. */
    value?: Color | string
    /**
     * Color selected before any interaction, when the component is uncontrolled.
     * @default '#ffffff'
     */
    defaultValue?: Color | string
    /** Fires on every change, including each frame of a drag inside the panel. */
    onValueChange?: (value: Color) => void
    /** Fires once a gesture ends, with the color that was landed on. */
    onValueCommitted?: (value: Color) => void
    /**
     * Format the trigger and the text input write the color in. Defaults to `'hexa'` when
     * `alpha` is set. An alpha format collapses to its opaque twin whenever the color is
     * fully opaque, so a solid color never picks up a trailing `ff`.
     * @default 'hex'
     */
    format?: ColorFormat
    /**
     * Add an alpha slider to the default panel, and back the preview with a checkerboard.
     * @default false
     */
    alpha?: boolean
    /**
     * Add a screen color-sampling button to the default panel. It renders only where the
     * browser supports the EyeDropper API, so there is no dead control on Firefox or Safari.
     * @default false
     */
    eyedropper?: boolean
    /**
     * Render the panel in place instead of behind a trigger and a popover. The trigger
     * props (`label`, `trigger`, `size`, the popover ones) do nothing in this mode.
     * @default false
     */
    inline?: boolean
    /**
     * Prevent interaction and dim the trigger and every control in the panel.
     * @default false
     */
    disabled?: boolean
    /**
     * Height and text scale of the default trigger.
     * @default 'md'
     */
    size?: ColorPickerSize
    /**
     * Visual style of the default trigger, from `Button`'s set. `flush` takes the button
     * shell off entirely, leaving the swatch and the label on their own.
     * @default 'ghost'
     */
    variant?: ColorPickerVariant
    /**
     * Text beside the swatch in the default trigger. Defaults to the color, formatted with
     * `format`. Pass `null` for a swatch-only square button.
     */
    label?: string | null
    /**
     * Rounded square or full circle, for the swatch on the default trigger.
     * @default 'rounded'
     */
    swatchShape?: ColorSwatchShape
    /**
     * Which side of the label the default trigger's swatch sits on. It is inset from that
     * edge by the same gap the button's height leaves above and below it.
     * @default 'start'
     */
    swatchPosition?: ColorPickerSwatchPosition
    /** Controlled open state of the popover. Pair with `onOpenChange`. */
    open?: boolean
    /**
     * Uncontrolled initial open state of the popover.
     * @default false
     */
    defaultOpen?: boolean
    /** Fires when the popover opens or closes. */
    onOpenChange?: (open: boolean) => void
    /**
     * Preferred popover side.
     * @default 'bottom'
     */
    side?: 'top' | 'bottom' | 'left' | 'right'
    /**
     * Popover alignment.
     * @default 'start'
     */
    align?: 'start' | 'center' | 'end'
    /**
     * Gap between the trigger and the popover.
     * @default 6
     */
    sideOffset?: number
    /**
     * Escape hatch forwarded to the inner `PopoverContent`. Use `customAnchor` to point
     * the panel at an element you own when `trigger={null}`, `trapFocus={false}` plus
     * `onOpenAutoFocus` / `onCloseAutoFocus` to leave the caret in a field, and
     * `onInteractOutside` to keep a press on that field from dismissing the panel.
     */
    popoverProps?: ColorPickerPopoverProps
    /**
     * Content of the popover trigger. Omitted uses the default swatch button. Pass a
     * snippet to put custom content inside `PopoverTrigger`. Pass `null` to render no
     * trigger (`open` and `popoverProps` still drive the popover).
     */
    trigger?: Snippet | null
    /** Name of the hidden input, used when submitting an HTML form. */
    name?: string
    /** `id` of the `<form>` the hidden input belongs to, when it sits outside it. */
    form?: string
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte'
  import { cn, commitBindableChange } from '../../internal/utils'
  import { describeColor, normalizeColor } from '../../internal/color-control'
  import { setColorPickerContext } from '../../internal/color-picker-context.svelte'
  import { formatColor } from '../../lib/color'
  import { buttonVariants } from '../button/button-variants'
  import ColorArea from '../color-area/color-area.svelte'
  import ColorSlider from '../color-slider/color-slider.svelte'
  import ColorSwatch from '../color-swatch/color-swatch.svelte'
  import { Popover, PopoverContent, PopoverTrigger } from '../popover'
  import ColorPickerEyeDropper from './color-picker-eyedropper.svelte'
  import ColorPickerInput from './color-picker-input.svelte'

  const DEFAULT_VALUE = '#ffffff'
  const panelClasses = 'flex w-fit min-w-50 flex-col gap-3'

  const TRIGGER_SIZES: Record<ColorPickerSize, { button: ColorPickerSize; swatch: number; iconSwatch: number }> = {
    sm: { button: 'sm', swatch: 20, iconSwatch: 24 },
    md: { button: 'md', swatch: 24, iconSwatch: 28 },
    lg: { button: 'lg', swatch: 28, iconSwatch: 32 },
  }

  const ICON_BUTTON_SIZES: Record<ColorPickerSize, 'icon-sm' | 'icon-md' | 'icon-lg'> = {
    sm: 'icon-sm',
    md: 'icon-md',
    lg: 'icon-lg',
  }

  const FLUSH_CLASSES =
    'size-auto rounded-none p-0 hover:before:bg-transparent data-popup-open:before:bg-transparent data-pressed:before:bg-transparent'

  const SWATCH_OFFSETS: Record<ColorPickerSize, Record<ColorPickerSwatchPosition, string>> = {
    sm: { start: '-ms-2.5', end: '-me-2.5' },
    md: { start: '-ms-3', end: '-me-3' },
    lg: { start: '-ms-3.5', end: '-me-3.5' },
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

  let {
    value = $bindable(),
    defaultValue = DEFAULT_VALUE,
    onValueChange,
    onValueCommitted,
    children,
    format: formatProp,
    alpha = false,
    eyedropper = false,
    inline = false,
    disabled = false,
    size = 'md',
    variant = 'ghost',
    label,
    swatchShape = 'rounded',
    swatchPosition = 'start',
    trigger,
    open = $bindable(),
    defaultOpen = false,
    onOpenChange,
    side = 'bottom',
    align = 'start',
    sideOffset = 6,
    popoverProps,
    name,
    form,
    class: className,
    'aria-label': ariaLabel,
    ...rest
  }: ColorPickerProps & { children?: Snippet } = $props()

  let uncontrolled = $state(normalizeColor(DEFAULT_VALUE))
  uncontrolled = untrack(() => normalizeColor(value ?? defaultValue))

  let innerOpen = $state(false)
  innerOpen = untrack(() => open ?? defaultOpen)

  $effect(() => {
    if (open !== undefined) innerOpen = open
  })

  const color = $derived(value !== undefined ? normalizeColor(value) : uncontrolled)
  const format = $derived(formatProp ?? (alpha ? 'hexa' : 'hex'))
  const valueText = $derived(formatColor(color, displayFormat(format, color)))
  const description = $derived(describeColor(color))
  const iconOnly = $derived(label === null)
  const sizes = $derived(TRIGGER_SIZES[size])

  function setValue(next: Color) {
    commitBindableChange({
      next,
      bound: value === undefined ? undefined : color,
      setBound: (bound) => {
        value = bound
      },
      setInner: (bound) => {
        uncontrolled = bound
      },
      onChange: onValueChange,
    })
  }

  function commitValue(next: Color) {
    onValueCommitted?.(next)
  }

  function handleOpenChange(next: boolean) {
    commitBindableChange({
      next,
      bound: open,
      setBound: (bound) => {
        open = bound
      },
      setInner: (bound) => {
        innerOpen = bound
      },
      onChange: onOpenChange,
    })
  }

  setColorPickerContext({
    get value() {
      return color
    },
    setValue,
    commitValue,
    get format() {
      return format
    },
    get disabled() {
      return disabled
    },
  })

  const triggerClass = $derived(
    cn(
      !trigger && [
        buttonVariants({
          variant: variant === 'flush' ? 'ghost' : variant,
          size: iconOnly ? ICON_BUTTON_SIZES[size] : sizes.button,
        }),
        variant === 'flush' && FLUSH_CLASSES,
      ],
      className,
    ),
  )
  const swatchOffset = $derived(iconOnly || variant === 'flush' ? undefined : SWATCH_OFFSETS[size][swatchPosition])
  const popoverClassName = $derived(popoverProps?.class)
  const popoverKeepMounted = $derived(popoverProps?.keepMounted)
  const popoverRest = $derived.by(() => {
    if (!popoverProps) return {}
    const { class: _className, keepMounted: _keepMounted, ...restProps } = popoverProps
    return restProps
  })
</script>

{#snippet defaultPanel()}
  <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" aria-label="Saturation and brightness" />
  <div class="flex items-center gap-3">
    {#if eyedropper}
      <ColorPickerEyeDropper />
    {/if}
    <div class="flex min-w-0 flex-1 flex-col gap-2">
      <ColorSlider channel="hue" />
      {#if alpha}
        <ColorSlider channel="alpha" />
      {/if}
    </div>
    {#if inline}
      <ColorSwatch size="sm" shape="circle" class="shrink-0" />
    {/if}
  </div>
  <ColorPickerInput />
{/snippet}

{#snippet panel()}
  {#if children}
    {@render children()}
  {:else}
    {@render defaultPanel()}
  {/if}
{/snippet}

{#snippet hiddenInput()}
  {#if name}
    <input type="hidden" {name} {form} value={valueText} />
  {/if}
{/snippet}

{#snippet defaultTrigger()}
  {#if swatchPosition === 'start'}
    <ColorSwatch
      aria-hidden="true"
      size={iconOnly ? sizes.iconSwatch : sizes.swatch}
      shape={swatchShape}
      class={swatchOffset}
    />
  {/if}
  {#if !iconOnly}
    <span>{label ?? valueText}</span>
  {/if}
  {#if swatchPosition === 'end'}
    <ColorSwatch
      aria-hidden="true"
      size={iconOnly ? sizes.iconSwatch : sizes.swatch}
      shape={swatchShape}
      class={swatchOffset}
    />
  {/if}
  {#if !ariaLabel}
    <span class="sr-only">{description}</span>
  {/if}
{/snippet}

{#if inline}
  <div
    role="group"
    aria-label={ariaLabel}
    data-slot="color-picker"
    data-disabled={disabled ? '' : undefined}
    class={cn(panelClasses, className)}
    {...rest}
  >
    {@render panel()}
    {@render hiddenInput()}
  </div>
{:else}
  <Popover open={innerOpen} onOpenChange={handleOpenChange}>
    {#if trigger !== null}
      <PopoverTrigger
        aria-label={ariaLabel ? `${ariaLabel}, ${description}` : undefined}
        data-slot="color-picker-trigger"
        {disabled}
        class={triggerClass}
        {...rest}
      >
        {#if trigger}
          {@render trigger()}
        {:else}
          {@render defaultTrigger()}
        {/if}
      </PopoverTrigger>
    {/if}
    <PopoverContent
      {side}
      {align}
      {sideOffset}
      arrow={false}
      aria-label={ariaLabel ?? 'Color picker'}
      keepMounted={popoverKeepMounted}
      data-slot="color-picker-panel"
      class={cn(panelClasses, 'max-w-none p-3', popoverClassName)}
      {...popoverRest}
    >
      {@render panel()}
    </PopoverContent>
  </Popover>
  {@render hiddenInput()}
{/if}
