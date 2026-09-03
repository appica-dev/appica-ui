<script lang="ts">
  import type { HTMLLiAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type Props = HTMLLiAttributes & { children?: Snippet }
  let { class: className, children, ...rest }: Props = $props()
</script>

<li data-slot="toc-item" class={className} {...rest}>
  {@render children?.()}
</li>
