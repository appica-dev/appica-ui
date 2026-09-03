<script lang="ts">
  import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements'
  import { untrack } from 'svelte'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { cn, commitBindableChange } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import { buttonVariants } from '../button/button-variants'
  import { inputVariants } from '../input/input-variants'

  type NumberFieldVariant = 'outline' | 'soft'
  type NumberFieldSize = 'sm' | 'md' | 'lg'
  type AnimDirection = 'up' | 'down'

  const numberFieldWidth: Record<NumberFieldSize, string> = {
    sm: 'w-24',
    md: 'w-30',
    lg: 'w-35',
  }

  const stepperSize: Record<NumberFieldSize, { size: 'icon-sm' | 'icon-md' | 'icon-lg'; override: string }> = {
    sm: { size: 'icon-sm', override: 'size-7 rounded-xs [&_svg]:size-3.5!' },
    md: { size: 'icon-md', override: 'size-9 rounded-sm [&_svg]:size-4!' },
    lg: { size: 'icon-lg', override: 'size-11 rounded-md [&_svg]:size-4.5!' },
  }

  const stepperButtonVariant: Record<NumberFieldVariant, 'soft' | 'outline'> = {
    outline: 'soft',
    soft: 'outline',
  }

  const inputSizeClasses: Record<NumberFieldSize, string> = {
    sm: 'text-xs pointer-coarse:text-base',
    md: 'text-sm pointer-coarse:text-base',
    lg: 'text-base',
  }

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    /**
     * Field appearance - bordered or filled.
     * @default 'outline'
     */
    variant?: NumberFieldVariant
    /**
     * Scales field width, steppers, and text.
     * @default 'md'
     */
    size?: NumberFieldSize
    /** Controlled value. Pair with `onValueChange` or `bind:value`. */
    value?: number | null
    /** Uncontrolled initial value. */
    defaultValue?: number | null
    /** Fires when the numeric value changes. */
    onValueChange?: (value: number | null) => void
    /** Fires when the value is committed (blur or enter). */
    onValueCommitted?: (value: number | null) => void
    min?: number
    max?: number
    step?: number
    format?: Intl.NumberFormatOptions
    locale?: string
    /**
     * Placeholder text shown when empty.
     * @default ' '
     */
    placeholder?: string
    name?: string
    disabled?: boolean
    id?: string
    /** Props forwarded to the inner `<input>`. */
    inputProps?: HTMLInputAttributes
  }

  let {
    class: className,
    variant = 'outline',
    size = 'md',
    value = $bindable(),
    defaultValue = null,
    onValueChange,
    onValueCommitted,
    min,
    max,
    step = 1,
    format,
    locale,
    placeholder = ' ',
    name,
    disabled,
    id,
    inputProps,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedby,
    ...rest
  }: Props = $props()

  const field = getFieldContext()
  const control = $derived(
    mergeFieldControl({
      field,
      id,
      name,
      disabled,
      ariaInvalid,
      ariaDescribedby,
    }),
  )

  const reduced = useReducedMotion()
  const formatter = $derived.by(() => {
    try {
      return new Intl.NumberFormat(locale, format)
    } catch {
      return new Intl.NumberFormat()
    }
  })

  function formatValue(next: number | null | undefined) {
    if (next == null || Number.isNaN(next)) return ''
    return formatter.format(next)
  }

  function clamp(next: number) {
    let result = next
    if (min != null && result < min) result = min
    if (max != null && result > max) result = max
    return result
  }

  function countDecimals(n: number) {
    const text = String(n)
    const i = text.indexOf('.')
    return i === -1 ? 0 : text.length - i - 1
  }

  function snap(next: number) {
    const decimals = Math.max(countDecimals(step), countDecimals(min ?? 0))
    return Number(next.toFixed(decimals))
  }

  let inner = $state<number | null>(null)
  inner = untrack(() => value ?? defaultValue)

  $effect(() => {
    if (value !== undefined) inner = value
  })

  let direction = $state<AnimDirection>('up')
  let isFocused = $state(false)
  let suppressFocus = false
  let draft = $state('')

  const display = $derived(formatValue(inner))
  const chars = $derived(Array.from(display))

  $effect(() => {
    if (!isFocused) draft = display
  })

  function commit(next: number | null, dir?: AnimDirection) {
    if (dir) direction = dir
    field?.clearFormError()
    commitBindableChange({
      next,
      bound: value,
      setBound: (nextValue) => {
        value = nextValue
      },
      setInner: (nextValue) => {
        inner = nextValue
      },
      onChange: onValueChange,
    })
  }

  function stepBy(delta: number) {
    const base = inner ?? min ?? 0
    commit(clamp(snap(base + delta)), delta > 0 ? 'up' : 'down')
  }

  function parseDraft(text: string): number | null {
    const trimmed = text.trim()
    if (trimmed === '') return null
    const normalized = trimmed.replace(/,/g, '')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  function commitDraft() {
    const parsed = parseDraft(draft)
    if (parsed == null) {
      const fallback = min ?? 0
      commit(fallback)
      onValueCommitted?.(fallback)
      draft = formatValue(fallback)
      return
    }
    const next = clamp(parsed)
    commit(next)
    onValueCommitted?.(next)
    draft = formatValue(next)
  }

  function handleStepperPointerDown() {
    suppressFocus = true
    isFocused = false
    setTimeout(() => {
      suppressFocus = false
    }, 0)
  }

  const stepperClass = $derived(
    cn(buttonVariants({ variant: stepperButtonVariant[variant], size: stepperSize[size].size }), stepperSize[size].override),
  )
  const atMin = $derived(inner != null && min != null && inner <= min)
  const atMax = $derived(inner != null && max != null && inner >= max)
</script>

<div
  data-slot="number-field"
  role="group"
  class={cn(inputVariants({ variant, size, state: 'within' }), 'h-auto shrink-0 p-px', numberFieldWidth[size], className)}
  aria-describedby={control.describedby}
  data-invalid={control.invalid ? '' : undefined}
  data-disabled={control.disabled ? '' : undefined}
  {...rest}
>
  <button
    type="button"
    data-slot="number-field-decrement"
    aria-label="Decrease value"
    class={stepperClass}
    disabled={control.disabled || atMin}
    data-invalid={control.invalid ? '' : undefined}
    onpointerdown={handleStepperPointerDown}
    onclick={() => stepBy(-step)}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  </button>

  <div class="relative flex-1 self-stretch overflow-hidden">
    <input
      data-slot="number-field-input"
      type="text"
      inputmode="decimal"
      {...inputProps}
      id={control.id}
      name={control.name}
      disabled={control.disabled}
      aria-invalid={control.ariaInvalid}
      aria-describedby={control.describedby}
      data-invalid={control.invalid ? '' : undefined}
      placeholder={placeholder}
      class={cn(
        'peer text-foreground absolute inset-0 h-full w-full bg-transparent text-center outline-none',
        inputSizeClasses[size],
        !reduced.current &&
          !isFocused &&
          'not-placeholder-shown:text-transparent not-placeholder-shown:caret-transparent',
        inputProps?.class,
      )}
      bind:value={draft}
      oninput={() => {
        const parsed = parseDraft(draft)
        if (parsed != null) commit(clamp(parsed))
      }}
      onpointerdown={() => {
        isFocused = true
      }}
      onfocus={() => {
        if (suppressFocus) return
        isFocused = true
        draft = inner == null ? '' : String(inner)
      }}
      onblur={() => {
        isFocused = false
        commitDraft()
      }}
      onkeydown={(event) => {
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          stepBy(step)
        } else if (event.key === 'ArrowDown') {
          event.preventDefault()
          stepBy(-step)
        } else if (event.key === 'Enter') {
          event.preventDefault()
          commitDraft()
        }
      }}
    />
    {#if !reduced.current}
      <div
        data-slot="number-field-overlay"
        aria-hidden="true"
        class={cn(
          'text-foreground pointer-events-none absolute inset-0 z-10 flex items-center justify-center peer-placeholder-shown:invisible',
          isFocused && 'invisible',
          inputSizeClasses[size],
        )}
      >
        <span class="inline-flex leading-none">
          {#each chars as ch, i (chars.length - 1 - i)}
            <span class="relative inline-block overflow-hidden">
              {#key ch}
                <span class={['inline-block', direction === 'up' ? 'digit-up' : 'digit-down']}>
                  {ch}
                </span>
              {/key}
            </span>
          {/each}
        </span>
      </div>
    {/if}
  </div>

  <button
    type="button"
    data-slot="number-field-increment"
    aria-label="Increase value"
    class={stepperClass}
    disabled={control.disabled || atMax}
    data-invalid={control.invalid ? '' : undefined}
    onpointerdown={handleStepperPointerDown}
    onclick={() => stepBy(step)}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  </button>
</div>

<style>
  @keyframes number-field-digit-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes number-field-digit-down {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .digit-up {
    animation: number-field-digit-up 220ms ease-out;
  }

  .digit-down {
    animation: number-field-digit-down 220ms ease-out;
  }
</style>
