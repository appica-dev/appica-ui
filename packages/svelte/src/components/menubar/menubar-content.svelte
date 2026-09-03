<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Menubar as BitsMenubar } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'
  import { getMenubarContext } from './menubar-context'
  import { popupClassName } from './menubar-variants'

  type Side = 'top' | 'bottom' | 'left' | 'right'
  type Align = 'start' | 'center' | 'end'

  type Props = HTMLAttributes<HTMLDivElement> & {
    side?: Side
    sideOffset?: number
    align?: Align
    /**
     * Keep the content mounted while closed so enter/exit animations can run.
     * @default false
     */
    keepMounted?: boolean
    children?: Snippet
  }

  let { class: className, side, sideOffset = 6, align, keepMounted = false, children, ...rest }: Props = $props()

  const ctx = getMenubarContext()
  const vertical = $derived(ctx.orientation === 'vertical')
  const resolvedSide = $derived(side ?? (vertical ? 'right' : 'bottom'))
  const resolvedAlign = $derived(align ?? (vertical ? 'start' : 'start'))
  const classes = $derived(popupClassName(ctx.size, className))
</script>

<BitsMenubar.Portal>
  <BitsMenubar.Content
    data-slot="menubar-content"
    class={classes}
    side={resolvedSide}
    align={resolvedAlign}
    {sideOffset}
    forceMount={keepMounted ? true : undefined}
    {...asBitsAttrs(rest)}
  >
    <div class="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">
      {@render children?.()}
    </div>
  </BitsMenubar.Content>
</BitsMenubar.Portal>
