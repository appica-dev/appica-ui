<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import { inputVariants } from '../input/input-variants'
  import { getAutocompleteContext } from './autocomplete-context'

  const ICON_SIZE = {
    sm: 'size-4',
    md: 'size-4.5',
    lg: 'size-5',
  } as const

  type Props = Omit<HTMLInputAttributes, 'size'> & {
    start?: Snippet
    end?: Snippet
  }

  let {
    class: className,
    start,
    end,
    placeholder,
    disabled,
    id,
    oninput,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedby,
    'aria-label': ariaLabel,
    ...rest
  }: Props = $props()

  const ctx = getAutocompleteContext()
  const field = getFieldContext()
  const control = $derived(
    mergeFieldControl({
      field,
      id,
      disabled,
      ariaInvalid,
      ariaDescribedby,
    }),
  )
  const canClear = $derived(ctx.clearable && ctx.hasValue())
  const isDisabled = $derived(control.disabled)
</script>

<div
  data-slot="autocomplete-input"
  class={cn(inputVariants({ variant: ctx.variant, size: ctx.size, state: 'within' }), className)}
  data-invalid={control.invalid ? '' : undefined}
  data-disabled={isDisabled ? '' : undefined}
>
  {#if start}
    <div data-slot="autocomplete-input-start" class="-ms-1 shrink-0">
      {@render start()}
    </div>
  {/if}
  <BitsCombobox.Input
    data-slot="autocomplete-input-field"
    placeholder={placeholder ?? ' '}
    disabled={isDisabled}
    id={control.id}
    aria-invalid={control.ariaInvalid}
    aria-describedby={control.describedby}
    aria-label={ariaLabel}
    class="peer text-foreground placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
    {...asBitsAttrs(rest)}
    oninput={(event) => {
      ctx.setInputValue(event.currentTarget.value)
      oninput?.(event)
    }}
  />
  {#if canClear}
    <button
      type="button"
      data-slot="autocomplete-clear"
      aria-label="Clear selection"
      disabled={isDisabled}
      class="text-foreground-subtle hover:text-foreground shrink-0 cursor-pointer transition-colors duration-200 outline-none disabled:pointer-events-none disabled:cursor-not-allowed motion-reduce:transition-none"
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
  {#if end}
    <div data-slot="autocomplete-input-end" class="shrink-0">
      {@render end()}
    </div>
  {/if}
  {#if ctx.icon}
    <BitsCombobox.Trigger
      data-slot="autocomplete-icon"
      tabindex={-1}
      aria-label="Toggle popup"
      disabled={isDisabled}
      class="group/autocomplete-icon text-foreground -me-1 shrink-0 cursor-pointer outline-none disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:cursor-not-allowed"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        class={cn(
          ICON_SIZE[ctx.size],
          'motion-safe:transition-transform motion-safe:duration-200',
          'group-data-popup-open/autocomplete-icon:rotate-180',
        )}
      >
        <path
          d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z"
        />
      </svg>
    </BitsCombobox.Trigger>
  {/if}
</div>
