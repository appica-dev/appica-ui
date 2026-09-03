<script lang="ts" module>
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import type { TimeValue } from 'bits-ui'
  export type TimeFieldVariant = 'outline' | 'soft'
  export type TimeFieldSize = 'sm' | 'md' | 'lg'
  export type TimeFieldGranularity = 'hour' | 'minute' | 'second'

  export type TimeFieldProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    /** Controlled value. Pair with `onValueChange` or `bind:value`. */
    value?: TimeValue
    /** Uncontrolled initial value. */
    defaultValue?: TimeValue
    /** Fires when the time changes. */
    onValueChange?: (value: TimeValue | undefined) => void
    /**
     * Field appearance - bordered or filled.
     * @default 'outline'
     */
    variant?: TimeFieldVariant
    /**
     * Height, padding, and text scale.
     * @default 'md'
     */
    size?: TimeFieldSize
    /** Adornment rendered before the segments, inside the frame. */
    start?: Snippet
    /** Adornment rendered after the segments, inside the frame. */
    end?: Snippet
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    name?: string
    /**
     * Drop the input appearance - for composing inside another field (used by `DatePicker`).
     * @default false
     */
    unstyled?: boolean
    /**
     * Smallest unit shown as a segment.
     * @default 'minute'
     */
    granularity?: TimeFieldGranularity
    /** Locale used to format segments. */
    locale?: string
    minValue?: TimeValue
    maxValue?: TimeValue
    /**
     * 12-hour or 24-hour clock.
     */
    hourCycle?: 12 | 24
  }
</script>

<script lang="ts">
  import { untrack } from 'svelte'
  import { TimeField as BitsTimeField } from 'bits-ui'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import { inputVariants } from '../input/input-variants'

  let {
    class: className,
    value = $bindable(),
    defaultValue,
    onValueChange,
    variant = 'outline',
    size = 'md',
    start,
    end,
    disabled,
    readonly,
    required,
    name,
    unstyled = false,
    granularity = 'minute',
    locale,
    minValue,
    maxValue,
    hourCycle,
    id,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedby,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...rest
  }: TimeFieldProps = $props()

  const field = getFieldContext()
  const control = $derived(
    mergeFieldControl({
      field,
      id,
      name,
      disabled,
      ariaInvalid,
      ariaDescribedby,
      omitId: true,
    }),
  )

  let inner = $state<TimeValue | undefined>(undefined)
  inner = untrack(() => value ?? defaultValue)

  $effect(() => {
    if (value !== undefined) inner = value
  })

  function handleValueChange(next: TimeValue | undefined) {
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

  const labelledBy = $derived([ariaLabelledby, field?.labelId].filter(Boolean).join(' ') || undefined)

  const rootClasses = $derived(
    cn(
      unstyled
        ? 'inline-flex min-w-0 items-center select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed'
        : cn(
            inputVariants({ variant, size, state: 'within' }),
            'select-none',
            'data-disabled:border-border-strong! data-disabled:bg-background-subtle! data-disabled:opacity-disabled data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:border-dashed',
          ),
      className,
    ),
  )

  const segmentClasses = cn(
    'rounded-3xs inline-block px-0.5 caret-transparent transition-colors duration-200 outline-none motion-reduce:transition-none',
    'focus:bg-(--selection-color)',
    'data-placeholder:text-foreground-subtle',
  )
</script>

<BitsTimeField.Root
  bind:value={inner}
  onValueChange={handleValueChange}
  disabled={control.disabled}
  {readonly}
  {required}
  {granularity}
  {locale}
  {minValue}
  {maxValue}
  {hourCycle}
  errorMessageId={control.invalid ? field?.errorId : undefined}
>
  <div
    data-slot="time-field"
    data-invalid={control.invalid ? '' : undefined}
    data-disabled={control.disabled ? '' : undefined}
    aria-invalid={control.ariaInvalid}
    aria-disabled={control.disabled || undefined}
    aria-label={ariaLabel}
    aria-labelledby={labelledBy}
    class={rootClasses}
    {...asBitsAttrs(rest)}
  >
    {#if start}
      <div data-slot="time-field-start" class="-ms-1 shrink-0">
        {@render start()}
      </div>
    {/if}
    <BitsTimeField.Input
      name={unstyled ? undefined : control.name}
      data-slot="time-field-segments"
      dir="ltr"
      class="text-foreground flex min-w-0 flex-1 items-center"
      aria-describedby={control.describedby}
    >
      {#snippet children({ segments })}
        {#each segments as segment, i (`${i}-${segment.part}`)}
          <BitsTimeField.Segment
            part={segment.part}
            data-slot="time-field-segment"
            class={segment.part === 'literal' ? 'text-foreground-subtle whitespace-pre' : segmentClasses}
          >
            {segment.value}
          </BitsTimeField.Segment>
        {/each}
      {/snippet}
    </BitsTimeField.Input>
    {#if end}
      <div data-slot="time-field-end" class="-me-1 shrink-0">
        {@render end()}
      </div>
    {/if}
  </div>
</BitsTimeField.Root>
