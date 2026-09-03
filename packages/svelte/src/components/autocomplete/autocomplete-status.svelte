<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getAutocompleteContext } from './autocomplete-context'

  const STATUS_SIZE = {
    sm: 'px-2.5 py-2 text-xs',
    md: 'px-3 py-2.5 text-sm',
    lg: 'px-3.5 py-3 text-base',
  } as const

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getAutocompleteContext()
</script>

<div data-slot="autocomplete-status" class={cn('text-foreground-muted text-center', STATUS_SIZE[ctx.size], className)} {...rest}>
  {@render children?.()}
</div>
