<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { ContextMenu as BitsContextMenu } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'
  import { getContextMenuContext } from './context-menu-context'
  import { popupClassName } from './context-menu-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Keep the content mounted while closed so enter/exit animations can run.
     * @default false
     */
    keepMounted?: boolean
    children?: Snippet
  }

  let { class: className, keepMounted = false, children, ...rest }: Props = $props()

  const ctx = getContextMenuContext()
  const classes = $derived(popupClassName(ctx.size, className))
</script>

<BitsContextMenu.Portal>
  <BitsContextMenu.Content
    data-slot="context-menu-content"
    class={classes}
    side="bottom"
    align="start"
    sideOffset={6}
    forceMount={keepMounted ? true : undefined}
    {...asBitsAttrs(rest)}
  >
    <div class="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">
      {@render children?.()}
    </div>
  </BitsContextMenu.Content>
</BitsContextMenu.Portal>
