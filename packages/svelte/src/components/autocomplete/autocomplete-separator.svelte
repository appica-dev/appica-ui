<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement>

  let { class: className, ...rest }: Props = $props()
</script>

<BitsCombobox.Separator
  data-slot="autocomplete-separator"
  class={cn('bg-border -mx-2 my-1.5 h-px shrink-0', className)}
  {...asBitsAttrs(rest)}
/>
