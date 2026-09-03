<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { DropdownMenu as BitsDropdownMenu } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'
  import { getDropdownMenuContext } from './dropdown-menu-context'
  import { popupClassName } from './dropdown-menu-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Keep the content mounted while closed so enter/exit animations can run.
     * @default false
     */
    keepMounted?: boolean
    children?: Snippet
  }

  let { class: className, keepMounted = false, children, ...rest }: Props = $props()

  const ctx = getDropdownMenuContext()
  const classes = $derived(popupClassName(ctx.size, className))
</script>

<BitsDropdownMenu.Portal>
  <BitsDropdownMenu.Content
    data-slot="dropdown-menu-content"
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
  </BitsDropdownMenu.Content>
</BitsDropdownMenu.Portal>
