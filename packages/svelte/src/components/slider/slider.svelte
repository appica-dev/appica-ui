<script lang="ts" module>
  export type SliderTooltipVisibility = 'always' | 'auto' | 'never'
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { untrack } from 'svelte'
  import { Slider as BitsSlider } from 'bits-ui'
  import { readTextDirection } from '../../internal/direction'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    /** Controlled value. A number for a single thumb, an array for a range. */
    value?: number | number[]
    /** Uncontrolled initial value. */
    defaultValue?: number | number[]
    /** Fires when the value changes. */
    onValueChange?: (value: number | number[]) => void
    /**
     * When the value tooltip shows - on interaction, always, or never.
     * @default 'auto'
     */
    tooltipVisibility?: SliderTooltipVisibility
    /** Accessible name for each thumb. Use a function to name range ends. */
    thumbAriaLabel?: string | ((index: number) => string)
    /**
     * @default 0
     */
    min?: number
    /**
     * @default 100
     */
    max?: number
    /**
     * @default 1
     */
    step?: number
    /**
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical'
    /**
     * Blocks interaction and dims the control.
     * @default false
     */
    disabled?: boolean
  }

  let {
    class: className,
    value = $bindable(),
    defaultValue,
    onValueChange,
    tooltipVisibility = 'auto',
    thumbAriaLabel,
    min = 0,
    max = 100,
    step = 1,
    orientation = 'horizontal',
    disabled,
    ...rest
  }: Props = $props()

  function toSingle(next: number | number[] | undefined): number {
    if (next == null) return 0
    return Array.isArray(next) ? (next[0] ?? 0) : next
  }

  function toMultiple(next: number | number[] | undefined): number[] {
    if (Array.isArray(next)) return next
    if (typeof next === 'number') return [next]
    return [0, 0]
  }

  let innerSingle = $state(0)
  let innerMultiple = $state<number[]>([0, 0])
  innerSingle = untrack(() => toSingle(value ?? defaultValue))
  innerMultiple = untrack(() => toMultiple(value ?? defaultValue))

  const isMultiple = $derived(Array.isArray(value) || (value === undefined && Array.isArray(defaultValue)))

  let rootEl: HTMLElement | null = $state(null)
  let textDir = $derived(readTextDirection(rootEl ?? undefined))

  $effect(() => {
    if (value === undefined) return
    if (Array.isArray(value)) innerMultiple = value
    else innerSingle = value
  })

  let hoveredIndex = $state<number | null>(null)
  let focusedIndex = $state<number | null>(null)

  function handleSingleChange(next: number) {
    commitBindableChange({
      next,
      bound: value,
      setBound: (nextValue) => {
        value = nextValue
      },
      setInner: (nextValue) => {
        innerSingle = toSingle(nextValue)
      },
      onChange: onValueChange,
    })
  }

  function handleMultipleChange(next: number[]) {
    commitBindableChange({
      next,
      bound: value,
      setBound: (nextValue) => {
        value = nextValue
      },
      setInner: (nextValue) => {
        innerMultiple = toMultiple(nextValue)
      },
      onChange: onValueChange,
    })
  }

  function resolveAriaLabel(index: number): string | undefined {
    if (typeof thumbAriaLabel === 'function') return thumbAriaLabel(index)
    return thumbAriaLabel
  }

  function tooltipOpen(index: number): boolean {
    if (tooltipVisibility === 'always') return true
    if (tooltipVisibility === 'never') return false
    return hoveredIndex === index || focusedIndex === index
  }

  const rootClasses = $derived(
    cn(
      'data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-fit',
      className,
    ),
  )

  const controlClasses =
    'relative flex w-full touch-none items-center select-none data-disabled:opacity-disabled data-disabled:pointer-events-none data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col'

  const trackClasses =
    'relative grow overflow-hidden rounded-full bg-background-strong select-none data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'

  const indicatorClasses =
    'bg-primary select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'

  const thumbClasses =
    'group relative block size-3 shrink-0 cursor-default rounded-full select-none disabled:pointer-events-none disabled:opacity-disabled'

  const thumbVisualClasses =
    'bg-background border-primary relative block size-full rounded-full border-2 shadow-xs transition-transform duration-250 group-hover:scale-125 group-focus-within:scale-125 motion-reduce:transition-none'

  const tooltipWrapperClasses =
    'absolute z-10 pointer-events-none transition-transform duration-250 group-hover:scale-110 group-focus-within:scale-110 motion-reduce:transition-none data-[orientation=horizontal]:bottom-full data-[orientation=horizontal]:left-1/2 data-[orientation=horizontal]:-translate-x-1/2 data-[orientation=horizontal]:mb-1 data-[orientation=horizontal]:origin-bottom data-[orientation=vertical]:top-1/2 data-[orientation=vertical]:-translate-y-1/2 data-[orientation=vertical]:inset-s-full data-[orientation=vertical]:ms-1'

  const tooltipInnerClasses =
    'bg-background-inverse text-foreground-inverse rounded-4xs block px-1 py-0.5 text-xs leading-none whitespace-nowrap'
</script>

{#if isMultiple}
  <BitsSlider.Root
    bind:ref={rootEl}
    type="multiple"
    data-slot="slider"
    class={rootClasses}
    bind:value={innerMultiple}
    {min}
    {max}
    {step}
    {orientation}
    {disabled}
    dir={textDir}
    onValueChange={handleMultipleChange}
    {...asBitsAttrs(rest)}
  >
    {#snippet children({ thumbItems })}
      <span data-slot="slider-control" data-orientation={orientation} class={controlClasses}>
        <span data-slot="slider-track" data-orientation={orientation} class={trackClasses}>
          <BitsSlider.Range data-slot="slider-indicator" class={indicatorClasses} />
        </span>
        {#each thumbItems as thumb (thumb.index)}
          <BitsSlider.Thumb
            index={thumb.index}
            aria-label={resolveAriaLabel(thumb.index)}
            data-slot="slider-thumb"
            class={thumbClasses}
            onpointerenter={() => (hoveredIndex = thumb.index)}
            onpointerleave={() => {
              if (hoveredIndex === thumb.index) hoveredIndex = null
            }}
            onfocus={() => (focusedIndex = thumb.index)}
            onblur={() => {
              if (focusedIndex === thumb.index) focusedIndex = null
            }}
          >
            <span data-slot="slider-thumb-visual" class={thumbVisualClasses}></span>
            {#if tooltipVisibility !== 'never' && tooltipOpen(thumb.index)}
              <span data-slot="slider-tooltip-wrapper" data-orientation={orientation} class={tooltipWrapperClasses}>
                <span data-slot="slider-tooltip" data-orientation={orientation} class={tooltipInnerClasses} aria-hidden="true">
                  {thumb.value}
                </span>
              </span>
            {/if}
          </BitsSlider.Thumb>
        {/each}
      </span>
    {/snippet}
  </BitsSlider.Root>
{:else}
  <BitsSlider.Root
    bind:ref={rootEl}
    type="single"
    data-slot="slider"
    class={rootClasses}
    bind:value={innerSingle}
    {min}
    {max}
    {step}
    {orientation}
    {disabled}
    dir={textDir}
    onValueChange={handleSingleChange}
    {...asBitsAttrs(rest)}
  >
    {#snippet children({ thumbItems })}
      <span data-slot="slider-control" data-orientation={orientation} class={controlClasses}>
        <span data-slot="slider-track" data-orientation={orientation} class={trackClasses}>
          <BitsSlider.Range data-slot="slider-indicator" class={indicatorClasses} />
        </span>
        {#each thumbItems as thumb (thumb.index)}
          <BitsSlider.Thumb
            index={thumb.index}
            aria-label={resolveAriaLabel(thumb.index)}
            data-slot="slider-thumb"
            class={thumbClasses}
            onpointerenter={() => (hoveredIndex = thumb.index)}
            onpointerleave={() => {
              if (hoveredIndex === thumb.index) hoveredIndex = null
            }}
            onfocus={() => (focusedIndex = thumb.index)}
            onblur={() => {
              if (focusedIndex === thumb.index) focusedIndex = null
            }}
          >
            <span data-slot="slider-thumb-visual" class={thumbVisualClasses}></span>
            {#if tooltipVisibility !== 'never' && tooltipOpen(thumb.index)}
              <span data-slot="slider-tooltip-wrapper" data-orientation={orientation} class={tooltipWrapperClasses}>
                <span data-slot="slider-tooltip" data-orientation={orientation} class={tooltipInnerClasses} aria-hidden="true">
                  {thumb.value}
                </span>
              </span>
            {/if}
          </BitsSlider.Thumb>
        {/each}
      </span>
    {/snippet}
  </BitsSlider.Root>
{/if}
