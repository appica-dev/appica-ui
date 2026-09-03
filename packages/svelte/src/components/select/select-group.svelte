<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Select as BitsSelect } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { children, ...rest }: Props = $props()
</script>

<BitsSelect.Group data-slot="select-group" {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsSelect.Group>
