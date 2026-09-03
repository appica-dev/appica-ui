<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = { children?: Snippet }

  let { children }: Props = $props()
</script>

{@render children?.()}
