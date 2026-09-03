<script lang="ts">
  import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import { inputVariants } from '../input/input-variants'
  import { getComboboxContext } from './combobox-context'

  const ICON_SIZE = {
    sm: 'size-4',
    md: 'size-4.5',
    lg: 'size-5',
  } as const

  const CHIPS_FILLED_MIN_H = {
    sm: 'has-data-[slot=combobox-chip]:min-h-8',
    md: 'has-data-[slot=combobox-chip]:min-h-10',
    lg: 'has-data-[slot=combobox-chip]:min-h-12',
  } as const

  const CONTROLS_FILLED_PAD = {
    sm: 'group-has-data-[slot=combobox-chip]/combobox-chips:pt-1 group-has-data-[slot=combobox-chip]/combobox-chips:pe-2',
    md: 'group-has-data-[slot=combobox-chip]/combobox-chips:pt-1.5 group-has-data-[slot=combobox-chip]/combobox-chips:pe-2.5',
    lg: 'group-has-data-[slot=combobox-chip]/combobox-chips:pt-2.5 group-has-data-[slot=combobox-chip]/combobox-chips:pe-3',
  } as const

  type Props = HTMLAttributes<HTMLDivElement> & {
    placeholder?: string
    inputProps?: Omit<HTMLInputAttributes, 'placeholder' | 'size'>
    children?: Snippet
  }

  let { class: className, placeholder, inputProps, children, ...rest }: Props = $props()

  const ctx = getComboboxContext()
  const field = getFieldContext()
  const control = $derived(
    mergeFieldControl({
      field,
      id: inputProps?.id,
      disabled: inputProps?.disabled,
      ariaInvalid: inputProps?.['aria-invalid'],
      ariaDescribedby: inputProps?.['aria-describedby'],
    }),
  )
  const canClear = $derived(ctx.clearable && ctx.hasValue())
  const hasControls = $derived(canClear || ctx.icon)
</script>

<div
  data-slot="combobox-chips"
  class={cn(
    'group/combobox-chips',
    inputVariants({ variant: ctx.variant, size: ctx.size, state: 'within' }),
    'has-data-[slot=combobox-chip]:h-auto has-data-[slot=combobox-chip]:flex-wrap has-data-[slot=combobox-chip]:items-start has-data-[slot=combobox-chip]:p-1',
    CHIPS_FILLED_MIN_H[ctx.size],
    className,
  )}
  data-invalid={control.invalid ? '' : undefined}
  {...rest}
>
  <div data-slot="combobox-chips-list" class="flex h-full min-w-0 flex-1 flex-wrap items-center gap-1 **:data-[slot=combobox-input-field]:px-1">
    {@render children?.()}
    <BitsCombobox.Input
      data-slot="combobox-input-field"
      placeholder={placeholder ?? ' '}
      disabled={control.disabled}
      id={control.id}
      aria-invalid={control.ariaInvalid}
      aria-describedby={control.describedby}
      class="peer text-foreground placeholder:text-foreground-subtle min-w-15 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
      {...asBitsAttrs(inputProps ?? {})}
    />
  </div>
  {#if hasControls}
    <div data-slot="combobox-controls" class={cn('flex shrink-0 items-center gap-1', CONTROLS_FILLED_PAD[ctx.size])}>
      {#if canClear}
        <button
          type="button"
          data-slot="combobox-clear"
          aria-label="Clear selection"
          class="text-foreground-subtle hover:text-foreground shrink-0 cursor-pointer transition-colors duration-200 outline-none motion-reduce:transition-none"
          onclick={(event) => {
            event.preventDefault()
            ctx.clear()
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" fill="currentColor" aria-hidden="true" class="size-[1em]">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
            />
          </svg>
        </button>
      {/if}
      {#if ctx.icon}
        <button
          type="button"
          data-slot="combobox-toggle"
          tabindex={-1}
          aria-label="Toggle popup"
          disabled={control.disabled}
          class="text-foreground -me-1 shrink-0 cursor-pointer outline-none disabled:cursor-not-allowed"
          onclick={(event) => {
            event.preventDefault()
            ctx.toggle()
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            class={cn(ICON_SIZE[ctx.size], 'motion-safe:transition-transform motion-safe:duration-200')}
          >
            <path
              d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z"
            />
          </svg>
        </button>
      {/if}
    </div>
  {/if}
</div>
