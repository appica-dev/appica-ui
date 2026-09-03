<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { ContextMenu as BitsContextMenu } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'
  import { getContextMenuContext } from './context-menu-context'
  import { popupClassName } from './context-menu-variants'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getContextMenuContext()
  const classes = $derived(popupClassName(ctx.size, className))
</script>

<BitsContextMenu.Portal>
  <BitsContextMenu.SubContent
    data-slot="context-menu-sub-content"
    class={classes}
    side="right"
    align="start"
    sideOffset={12}
    {...asBitsAttrs(rest)}
  >
    <div class="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">
      {@render children?.()}
    </div>
  </BitsContextMenu.SubContent>
</BitsContextMenu.Portal>
