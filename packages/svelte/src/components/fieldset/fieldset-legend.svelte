<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLLegendElement> & {
    children?: Snippet
  }

  let { class: className, children, ...rest }: Props = $props()
</script>

<legend data-slot="fieldset-legend" class={cn('text-foreground-intense text-lg font-medium', className)} {...rest}>
  {@render children?.()}
</legend>
