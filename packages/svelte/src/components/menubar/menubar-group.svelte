<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Menubar as BitsMenubar } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { children, ...rest }: Props = $props()
</script>

<BitsMenubar.Group data-slot="menubar-group" {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsMenubar.Group>
