<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type Props = HTMLAttributes<HTMLTableSectionElement> & { children?: Snippet }
  let { class: className, children, ...rest }: Props = $props()
</script>

<tbody data-slot="table-body" class={className} {...rest}>
  {@render children?.()}
</tbody>
