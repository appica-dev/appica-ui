<script lang="ts">
  import type { HTMLTdAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type Props = HTMLTdAttributes & { children?: Snippet }
  let { class: className, children, ...rest }: Props = $props()
</script>

<td data-slot="table-cell" class={className} {...rest}>
  {@render children?.()}
</td>
