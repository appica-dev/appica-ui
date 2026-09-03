<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Select as BitsSelect } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import { inputVariants } from '../input/input-variants'
  import { getSelectContext } from './select-context'

  const ICON_SIZE = {
    sm: 'size-4',
    md: 'size-4.5',
    lg: 'size-5',
  } as const

  type Props = HTMLButtonAttributes & {
    /**
     * Render a clear control inside the trigger when a value is present.
     * @default false
     */
    clearable?: boolean
    /** Adornment before the value. Pair with `alignItemWithTrigger={false}`. */
    start?: Snippet
    /** Adornment after the value, before the chevron. */
    end?: Snippet
    children?: Snippet
  }

  let {
    class: className,
    clearable = false,
    start,
    end,
    disabled,
    id,
    onkeydown,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedby,
    children,
    ...rest
  }: Props = $props()

  const ctx = getSelectContext()
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
  const canClear = $derived(clearable && ctx.hasValue())
  const iconSize = $derived(ICON_SIZE[ctx.size])
  const classes = $derived(
    cn(
      inputVariants({ variant: ctx.variant, size: ctx.size, state: 'self' }),
      'data-placeholder:text-foreground-subtle flex items-center justify-between',
      className,
    ),
  )

  function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onkeydown?.(event)
    if (event.defaultPrevented) return
    if (canClear && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault()
      ctx.clear()
    }
  }
</script>

<BitsSelect.Trigger
  data-slot="select-trigger"
  class={classes}
  disabled={control.disabled}
  id={control.id}
  aria-invalid={control.ariaInvalid}
  aria-describedby={control.describedby}
  data-invalid={control.invalid ? '' : undefined}
  onkeydown={handleKeyDown}
  {...asBitsAttrs(rest)}
  role="combobox"
>
  {#if start}
    <span data-slot="select-trigger-start" class="-ms-1 shrink-0">
      {@render start()}
    </span>
  {/if}
  <span class="flex min-w-0 flex-1 items-center truncate text-start">
    {@render children?.()}
  </span>
  {#if canClear}
    <span
      data-slot="select-clear"
      aria-hidden="true"
      onpointerdown={(event) => {
        event.stopPropagation()
        event.preventDefault()
        ctx.clear()
      }}
      onclick={(event) => {
        event.stopPropagation()
      }}
      class="text-foreground-subtle hover:text-foreground shrink-0 cursor-pointer transition-colors duration-200 motion-reduce:transition-none"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" fill="currentColor" aria-hidden="true" class="size-[1em]">
        <path
          d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
        />
      </svg>
    </span>
  {/if}
  {#if end}
    <span data-slot="select-trigger-end" class="shrink-0">
      {@render end()}
    </span>
  {/if}
  <span data-slot="select-icon" class="text-foreground -me-1 shrink-0">
    {#if ctx.alignItemWithTrigger}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class={iconSize}>
        <path
          d="M10.26 9.593c.225-.224.589-.224.814 0s.224.589 0 .813l-2.667 2.667c-.225.224-.589.224-.813 0l-2.666-2.667c-.225-.225-.225-.589 0-.813s.588-.224.813 0l2.26 2.26 2.261-2.26zM7.593 2.927c.225-.225.589-.225.813 0l2.667 2.666c.224.224.224.589 0 .813s-.589.225-.814 0L7.999 4.146 5.74 6.407c-.225.224-.588.224-.812 0s-.225-.589 0-.813l2.666-2.666z"
        />
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        class={cn(
          iconSize,
          'motion-safe:transition-transform motion-safe:duration-200',
          'data-popup-open:rotate-180',
        )}
      >
        <path
          d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z"
        />
      </svg>
    {/if}
  </span>
</BitsSelect.Trigger>
