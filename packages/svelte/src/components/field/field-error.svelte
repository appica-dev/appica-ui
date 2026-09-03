<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { requireFieldContext } from './field-context'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * When `false`, the message stays collapsed even if the field is invalid.
     * @default true
     */
    match?: boolean
    children?: Snippet
  }

  let { class: className, match = true, children, ...rest }: Props = $props()

  const field = requireFieldContext()
  const show = $derived(match && field.invalid())
  const message = $derived(field.formError())
</script>

<div
  class={cn(
    'grid grid-rows-[0fr]',
    'has-[[data-slot=field-error]]:grid-rows-[1fr]',
    'motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-safe:ease-out',
  )}
>
  {#if show}
    <div
      data-slot="field-error"
      id={field.errorId}
      class={cn(
        'min-h-0 overflow-hidden',
        'text-error-emphasis flex gap-1 pt-1 text-xs',
        "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
        className,
      )}
      {...rest}
    >
      {#if children}
        {@render children()}
      {:else if message}
        {message}
      {/if}
    </div>
  {/if}
</div>
