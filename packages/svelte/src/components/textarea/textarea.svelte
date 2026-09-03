<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import type { VariantProps } from 'class-variance-authority'
  import { cn, setNativeValue } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import { inputVariants } from '../input/input-variants'

  type TextareaVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
  type TextareaSize = NonNullable<VariantProps<typeof inputVariants>['size']>

  const sizePaddingY: Record<TextareaSize, string> = {
    sm: 'py-2',
    md: 'py-2.5',
    lg: 'py-3',
  }

  const sizeMinHeight: Record<TextareaSize, string> = {
    sm: 'min-h-16',
    md: 'min-h-20',
    lg: 'min-h-24',
  }

  const sizePaddingYRem: Record<TextareaSize, string> = {
    sm: '0.5rem',
    md: '0.625rem',
    lg: '0.75rem',
  }

  type Props = Omit<HTMLTextareaAttributes, 'size'> & {
    /**
     * Field appearance - bordered or filled.
     * @default 'outline'
     */
    variant?: TextareaVariant
    /**
     * Scales padding and text. Named `inputSize` to avoid colliding with native attributes.
     * @default 'md'
     */
    inputSize?: TextareaSize
    /**
     * Show a clear (✕) button once the field has a value.
     * @default false
     */
    clearable?: boolean
    /** Adornment rendered before the field, aligned to the first line. */
    start?: Snippet
    /** Adornment rendered after the field, aligned to the first line. */
    end?: Snippet
    /** Called when the clear button is pressed. */
    onClear?: () => void
    value?: string
  }

  let {
    class: className,
    variant = 'outline',
    inputSize = 'md',
    clearable = false,
    start,
    end,
    onClear,
    value = $bindable(),
    rows = 3,
    placeholder,
    disabled,
    id,
    name,
    oninput,
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

  let textareaEl: HTMLTextAreaElement | undefined = $state()
  const hasWrapper = $derived(Boolean(clearable || start || end))
  const invalid = $derived(control.invalid)

  function handleInput(event: Event & { currentTarget: HTMLTextAreaElement }) {
    field?.clearFormError()
    oninput?.(event)
  }

  function handleClear() {
    if (value !== undefined) {
      value = ''
    } else if (textareaEl) {
      setNativeValue(textareaEl, '')
    }
    textareaEl?.focus()
    field?.clearFormError()
    onClear?.()
  }
</script>

{#if !hasWrapper}
  <textarea
    bind:this={textareaEl}
    bind:value
    data-slot="textarea"
    data-invalid={invalid ? '' : undefined}
    data-disabled={control.disabled ? '' : undefined}
    id={control.id}
    name={control.name}
    disabled={control.disabled}
    aria-invalid={control.ariaInvalid}
    aria-describedby={control.describedby}
    {rows}
    {placeholder}
    oninput={handleInput}
    class={cn(
      inputVariants({ variant, size: inputSize, state: 'self' }),
      'placeholder:text-foreground-subtle h-auto resize-y',
      sizePaddingY[inputSize],
      sizeMinHeight[inputSize],
      className,
    )}
    {...rest}
  ></textarea>
{:else}
  <div
    data-slot="textarea-wrapper"
    data-invalid={invalid ? '' : undefined}
    style="--textarea-h: calc({rows} * 1lh + 2 * {sizePaddingYRem[inputSize]} + 2px)"
    class={cn(
      inputVariants({ variant, size: inputSize, state: 'within' }),
      'h-(--textarea-h) resize-y items-start overflow-hidden',
      sizeMinHeight[inputSize],
      sizePaddingY[inputSize],
      'has-[textarea:disabled]:border-border-strong! has-[textarea:disabled]:bg-background-subtle! has-[textarea:disabled]:opacity-disabled has-[textarea:disabled]:cursor-not-allowed has-[textarea:disabled]:border-dashed',
      className,
    )}
  >
    {#if start}
      <div data-slot="textarea-start" class="-ms-1 inline-flex h-lh shrink-0 items-center">
        {@render start()}
      </div>
    {/if}
    <textarea
      bind:this={textareaEl}
      bind:value
      data-slot="textarea"
      id={control.id}
      name={control.name}
      disabled={control.disabled}
      aria-invalid={control.ariaInvalid}
      aria-describedby={control.describedby}
      data-invalid={invalid ? '' : undefined}
      {rows}
      placeholder={placeholder ?? ' '}
      class="peer text-foreground placeholder:text-foreground-subtle min-w-0 flex-1 resize-none self-stretch bg-transparent outline-none disabled:cursor-not-allowed"
      oninput={handleInput}
      {...rest}
    ></textarea>
    {#if clearable}
      <button
        data-slot="textarea-clear"
        type="button"
        onclick={handleClear}
        class="text-foreground-subtle hover:text-foreground pointer-events-none inline-flex h-lh shrink-0 cursor-pointer items-center opacity-0 transition-[opacity,color] duration-200 peer-not-placeholder-shown:pointer-events-auto peer-not-placeholder-shown:opacity-100 motion-reduce:transition-none"
        tabindex={-1}
        aria-label="Clear input"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" fill="currentColor" class="size-[1em]">
          <path
            d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
          />
        </svg>
      </button>
    {/if}
    {#if end}
      <div data-slot="textarea-end" class="-me-1 inline-flex h-lh shrink-0 items-center">
        {@render end()}
      </div>
    {/if}
  </div>
{/if}
