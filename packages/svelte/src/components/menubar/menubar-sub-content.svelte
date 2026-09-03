<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Menubar as BitsMenubar } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'
  import { getMenubarContext } from './menubar-context'
  import { popupClassName } from './menubar-variants'

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getMenubarContext()
  const classes = $derived(popupClassName(ctx.size, className))
</script>

<BitsMenubar.Portal>
  <BitsMenubar.SubContent
    data-slot="menubar-sub-content"
    class={classes}
    side="right"
    align="start"
    sideOffset={12}
    {...asBitsAttrs(rest)}
  >
    <div class="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">
      {@render children?.()}
    </div>
  </BitsMenubar.SubContent>
</BitsMenubar.Portal>
