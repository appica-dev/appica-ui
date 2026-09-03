<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { DropdownMenu as BitsDropdownMenu } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'
  import { getDropdownMenuContext } from './dropdown-menu-context'
  import { popupClassName } from './dropdown-menu-variants'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getDropdownMenuContext()
  const classes = $derived(popupClassName(ctx.size, className))
</script>

<BitsDropdownMenu.Portal>
  <BitsDropdownMenu.SubContent
    data-slot="dropdown-menu-sub-content"
    class={classes}
    side="right"
    align="start"
    sideOffset={12}
    {...asBitsAttrs(rest)}
  >
    <div class="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">
      {@render children?.()}
    </div>
  </BitsDropdownMenu.SubContent>
</BitsDropdownMenu.Portal>
