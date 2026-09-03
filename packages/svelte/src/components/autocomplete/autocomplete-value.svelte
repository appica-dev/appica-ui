<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getAutocompleteContext } from './autocomplete-context'

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    placeholder?: string
    children?: Snippet<[value: string]>
  }

  let { class: className, placeholder, children, ...rest }: Props = $props()

  const ctx = getAutocompleteContext()
  const current = $derived(ctx.inputValue())
  const empty = $derived(current === '')
</script>

<span data-slot="autocomplete-value" class={cn('min-w-0 flex-1 truncate text-start', empty && 'text-foreground-subtle', className)} {...rest}>
  {#if empty}
    {placeholder ?? ''}
  {:else if children}
    {@render children(current)}
  {:else}
    {current}
  {/if}
</span>
