<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type Props = HTMLAttributes<HTMLTableSectionElement> & { children?: Snippet }
  let { class: className, children, ...rest }: Props = $props()
</script>

<thead data-slot="table-header" class={className} {...rest}>
  {@render children?.()}
</thead>
