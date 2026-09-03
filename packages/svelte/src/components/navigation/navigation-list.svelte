<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getNavigationContext, HORIZONTAL_GAP, VERTICAL_GAP } from './navigation-context'

  type Props = HTMLAttributes<HTMLUListElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getNavigationContext()
  const orientation = $derived(ctx?.orientation() ?? 'horizontal')
  const variant = $derived(ctx?.variant() ?? 'pill')
  const layout = $derived(
    cn(
      'flex',
      orientation === 'vertical' && 'flex-col',
      (orientation === 'vertical' ? VERTICAL_GAP : HORIZONTAL_GAP)[variant],
    ),
  )
</script>

<ul data-slot="navigation-list" role="list" class={cn(layout, className)} {...rest}>
  {@render children?.()}
</ul>
