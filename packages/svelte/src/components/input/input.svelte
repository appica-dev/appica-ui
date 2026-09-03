<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import type { VariantProps } from 'class-variance-authority'
  import { cn, setNativeValue } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import { inputVariants } from './input-variants'

  type InputVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
  type InputSize = NonNullable<VariantProps<typeof inputVariants>['size']>

  type Props = Omit<HTMLInputAttributes, 'size'> & {
    /**
     * Field appearance - bordered or filled.
     * @default 'outline'
     */
    variant?: InputVariant
    /**
     * Scales height, padding, and text. Named `inputSize` to avoid the native `size` attribute.
     * @default 'md'
     */
    inputSize?: InputSize
    /**
     * Show a clear (✕) button once the field has a value.
     * @default false
     */
    clearable?: boolean
    /** Adornment rendered before the field, inside the frame. */
    start?: Snippet
    /** Adornment rendered after the field, inside the frame. */
    end?: Snippet
    /** Called when the clear button is pressed. */
    onClear?: () => void
    value?: string
    /**
     * Native `size` attribute (character width). Named `htmlSize` to avoid clashing
     * with the visual `inputSize` scale.
     */
    htmlSize?: number
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
    placeholder,
    disabled,
    id,
    name,
    oninput,
    htmlSize,
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

  let inputEl: HTMLInputElement | undefined = $state()
  const hasWrapper = $derived(Boolean(clearable || start || end))
  const invalid = $derived(control.invalid)

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    field?.clearFormError()
    oninput?.(event)
  }

  function handleClear() {
    if (value !== undefined) {
      value = ''
    } else if (inputEl) {
      setNativeValue(inputEl, '')
    }
    inputEl?.focus()
    field?.clearFormError()
    onClear?.()
  }
</script>

{#if !hasWrapper}
  <input
    bind:this={inputEl}
    bind:value
    data-slot="input"
    data-invalid={invalid ? '' : undefined}
    data-disabled={control.disabled ? '' : undefined}
    id={control.id}
    name={control.name}
    disabled={control.disabled}
    aria-invalid={control.ariaInvalid}
    aria-describedby={control.describedby}
    {placeholder}
    class={cn(inputVariants({ variant, size: inputSize, state: 'self' }), 'placeholder:text-foreground-subtle', className)}
    size={htmlSize}
    oninput={handleInput}
    {...rest}
  />
{:else}
  <div
    data-slot="input-wrapper"
    data-invalid={invalid ? '' : undefined}
    class={cn(inputVariants({ variant, size: inputSize, state: 'within' }), className)}
  >
    {#if start}
      <div data-slot="input-start" class="-ms-1 flex shrink-0 items-center">
        {@render start()}
      </div>
    {/if}
    <input
      bind:this={inputEl}
      bind:value
      data-slot="input"
      id={control.id}
      name={control.name}
      disabled={control.disabled}
      aria-invalid={control.ariaInvalid}
      aria-describedby={control.describedby}
      data-invalid={invalid ? '' : undefined}
      placeholder={placeholder ?? ' '}
      class="peer text-foreground placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
      size={htmlSize}
      oninput={handleInput}
      {...rest}
    />
    {#if clearable}
      <button
        data-slot="input-clear"
        type="button"
        onclick={handleClear}
        class="text-foreground-subtle hover:text-foreground pointer-events-none shrink-0 cursor-pointer opacity-0 transition-[opacity,color] duration-200 peer-not-placeholder-shown:pointer-events-auto peer-not-placeholder-shown:opacity-100"
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
      <div data-slot="input-end" class="-me-1 flex shrink-0 items-center">
        {@render end()}
      </div>
    {/if}
  </div>
{/if}
