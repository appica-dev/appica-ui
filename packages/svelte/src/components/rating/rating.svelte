<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { untrack } from 'svelte'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { cn } from '../../internal/utils'
  import RatingItemVisual from './rating-item-visual.svelte'
  import {
    clamp,
    quantize,
    readTextDirection,
    round,
    type RatingIconPair,
    type RatingOrientation,
    type RatingVariant,
  } from './rating-model'

  const ITEM_PADDING = 'p-[calc(var(--rating-size)/6)]'

  const defaultItemAriaLabel = (value: number, count: number) => `${value} of ${count}`

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    /** Controlled rating. Pair with `onValueChange` or `bind:value`. */
    value?: number
    /**
     * Uncontrolled initial rating. `0` means unrated.
     * @default 0
     */
    defaultValue?: number
    /** Fires when the rating is committed by a click or a key press. */
    onValueChange?: (value: number) => void
    /** Fires with the `step`-snapped rating under the pointer, and with `null` when it leaves. */
    onHoverChange?: (value: number | null) => void
    /**
     * How many items to render.
     * @default 5
     */
    count?: number
    /**
     * Smallest selectable fraction of an item. Use `0.5` for half icons.
     * @default 1
     */
    step?: number
    /**
     * Icon pair to render. Defaults to a built-in star.
     */
    icon?: RatingIconPair
    /**
     * `'filled'` draws unrated items as muted solid icons, `'outline'` draws them as line icons.
     * @default 'filled'
     */
    variant?: RatingVariant
    /**
     * Lay the items out in a row or a column. A vertical rating fills from the top down.
     * @default 'horizontal'
     */
    orientation?: RatingOrientation
    /**
     * Icon size. A number is read as pixels; a string is used verbatim, so any CSS length works (`'2rem'`, `'1em'` to follow the surrounding text).
     * @default 24
     */
    size?: number | string
    /**
     * Track the pointer with a continuous fill before the rating is committed. Clicking still selects at `step` precision either way.
     * @default true
     */
    hoverable?: boolean
    /**
     * Selecting the current rating again resets it to `0`.
     * @default false
     */
    clearable?: boolean
    /**
     * Blocks interaction and dims the control.
     * @default false
     */
    disabled?: boolean
    /**
     * Renders a non-interactive display of `value`, exposed as a single labeled image.
     * @default false
     */
    readOnly?: boolean
    /** Field name submitted with a form, via a hidden input. */
    name?: string
    /** Accessible name for each item, describing the rating it selects. */
    itemAriaLabel?: (value: number, count: number) => string
  }

  let {
    value = $bindable(),
    defaultValue = 0,
    onValueChange,
    onHoverChange,
    count = 5,
    step = 1,
    icon,
    variant = 'filled',
    orientation = 'horizontal',
    size = 24,
    hoverable = true,
    clearable = false,
    disabled = false,
    readOnly = false,
    name,
    itemAriaLabel = defaultItemAriaLabel,
    class: className,
    style,
    'aria-label': ariaLabel,
    ...rest
  }: Props = $props()

  const reducedMotion = useReducedMotion()
  const reduced = $derived(reducedMotion.current)
  const vertical = $derived(orientation === 'vertical')

  let uncontrolled = $state(0)
  uncontrolled = untrack(() => defaultValue)
  let hover = $state<number | null>(null)
  let hoverSnap = $state<number | null>(null)
  let pressedIndex = $state<number | null>(null)
  let rtl = $state(false)
  let rootEl: HTMLDivElement | undefined
  let itemEls: Array<HTMLButtonElement | undefined> = []

  const current = $derived(value ?? uncontrolled)
  const interactive = $derived(!disabled && !readOnly)
  const previewing = $derived(hoverable && hover !== null)
  const displayed = $derived(previewing ? hover! : current)
  const checkedIndex = $derived(current > 0 ? Math.ceil(current) - 1 : 0)

  function attach(el: HTMLDivElement) {
    rootEl = el
    rtl = readTextDirection(el) === 'rtl'
    return () => {
      if (rootEl === el) rootEl = undefined
    }
  }

  function commit(next: number) {
    const resolved = clamp(round(next), 0, count)
    const previous = current
    if (value === undefined) uncontrolled = resolved
    else if (!onValueChange) value = resolved
    if (resolved !== previous) onValueChange?.(resolved)
  }

  function updateHover(next: number | null) {
    if (hoverSnap === next) return
    hoverSnap = next
    if (hoverable) hover = next
    onHoverChange?.(next)
  }

  function trackPointer(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const span = vertical ? rect.height : rect.width
    if (span === 0) return
    const offset = vertical ? event.clientY - rect.top : event.clientX - rect.left
    const ratio = offset / span
    const exact = clamp((!vertical && rtl ? 1 - ratio : ratio) * count, 0, count)
    updateHover(quantize(exact, step, count))
  }

  function handleItemClick(event: MouseEvent, index: number) {
    const next = (event.detail === 0 ? null : hoverSnap) ?? index + 1
    commit(clearable && next === current ? 0 : next)
  }

  function releasePress(index: number) {
    if (pressedIndex === index) pressedIndex = null
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!interactive) return
    let next: number
    switch (event.key) {
      case 'ArrowRight':
        next = current + (rtl ? -step : step)
        break
      case 'ArrowLeft':
        next = current + (rtl ? step : -step)
        break
      case 'ArrowDown':
        next = current + step
        break
      case 'ArrowUp':
        next = current - step
        break
      case 'Home':
        next = step
        break
      case 'End':
        next = count
        break
      default:
        return
    }
    event.preventDefault()
    updateHover(null)
    const resolved = clamp(round(next), clearable ? 0 : step, count)
    commit(resolved)
    itemEls[Math.max(0, Math.ceil(resolved) - 1)]?.focus()
  }

  const rootStyle = $derived(
    `--rating-size: ${typeof size === 'number' ? `${size}px` : size};${style ? ` ${style}` : ''}`,
  )
  const rootClasses = cn(
    'text-primary relative inline-flex w-fit items-center data-disabled:cursor-not-allowed data-disabled:opacity-disabled',
    'data-[orientation=vertical]:flex-col',
    'data-[orientation=horizontal]:mx-[calc(var(--rating-size)/-6)]',
    'data-[orientation=vertical]:my-[calc(var(--rating-size)/-6)]',
  )
  const itemClasses = cn(
    'outline-ring rounded-sm relative inline-flex cursor-pointer items-center justify-center disabled:pointer-events-none',
    ITEM_PADDING,
  )

  const indices = $derived(Array.from({ length: count }, (_, index) => index))
</script>

<div
  {@attach attach}
  data-slot="rating"
  data-orientation={orientation}
  role={readOnly ? 'img' : 'radiogroup'}
  aria-label={ariaLabel ?? (readOnly ? `${current} out of ${count}` : undefined)}
  aria-orientation={readOnly ? undefined : orientation}
  data-disabled={disabled ? '' : undefined}
  data-readonly={readOnly ? '' : undefined}
  class={cn(rootClasses, className)}
  style={rootStyle}
  onkeydown={interactive ? handleKeyDown : undefined}
  onpointermove={interactive ? trackPointer : undefined}
  onpointerdown={interactive ? trackPointer : undefined}
  onpointerleave={interactive ? () => updateHover(null) : undefined}
  onpointercancel={interactive ? () => updateHover(null) : undefined}
  {...rest}
>
  {#each indices as index (index)}
    {#if readOnly}
      <span data-slot="rating-item" class={cn('inline-flex', ITEM_PADDING)}>
        <RatingItemVisual
          {index}
          {displayed}
          {hover}
          {pressedIndex}
          {reduced}
          {rtl}
          {vertical}
          {variant}
          {disabled}
          {icon}
        />
      </span>
    {:else}
      {@const checked = Math.ceil(current) === index + 1}
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        aria-label={itemAriaLabel(index + 1, count)}
        tabindex={index === checkedIndex ? 0 : -1}
        disabled={disabled}
        data-slot="rating-item"
        data-checked={checked ? '' : undefined}
        {@attach (el: HTMLButtonElement) => {
          itemEls[index] = el
          return () => {
            if (itemEls[index] === el) itemEls[index] = undefined
          }
        }}
        class={itemClasses}
        onclick={(event) => handleItemClick(event, index)}
        onpointerdown={() => (pressedIndex = index)}
        onpointerup={() => releasePress(index)}
        onpointerleave={() => releasePress(index)}
        onpointercancel={() => releasePress(index)}
        onblur={() => releasePress(index)}
        onkeydown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') pressedIndex = index
        }}
        onkeyup={() => releasePress(index)}
      >
        <RatingItemVisual
          {index}
          {displayed}
          {hover}
          {pressedIndex}
          {reduced}
          {rtl}
          {vertical}
          {variant}
          {disabled}
          {icon}
        />
      </button>
    {/if}
  {/each}
  {#if name}
    <input type="hidden" {name} value={String(current)} />
  {/if}
</div>
