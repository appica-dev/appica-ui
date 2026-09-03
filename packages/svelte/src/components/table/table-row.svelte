<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type Props = HTMLAttributes<HTMLTableRowElement> & {
    /**
     * Apply the persistent highlight background (`data-highlighted`).
     * @default false
     */
    highlighted?: boolean
    children?: Snippet
  }

  let { highlighted = false, class: className, children, ...rest }: Props = $props()
</script>

<tr data-slot="table-row" data-highlighted={highlighted ? '' : undefined} class={className} {...rest}>
  {@render children?.()}
</tr>
