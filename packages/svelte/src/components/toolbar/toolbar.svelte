<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { setToolbarContext, ToolbarState, type ToolbarOrientation } from './toolbar-context.svelte'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Lay items in a row or a column.
     * @default 'horizontal'
     */
    orientation?: ToolbarOrientation
    /**
     * Disable every item in the toolbar.
     * @default false
     */
    disabled?: boolean
    children?: Snippet
  }

  let {
    class: className,
    orientation = 'horizontal',
    disabled = false,
    children,
    ...rest
  }: Props = $props()

  const ctx = new ToolbarState()
  ctx.getOrientation = () => orientation
  ctx.getDisabled = () => disabled
  setToolbarContext(ctx)

  function handleKeydown(event: KeyboardEvent) {
    if (disabled) return
    const rtl = event.currentTarget instanceof HTMLElement && getComputedStyle(event.currentTarget).direction === 'rtl'
    const vertical = orientation === 'vertical'
    switch (event.key) {
      case 'ArrowRight':
        if (vertical) return
        event.preventDefault()
        ctx.move(rtl ? -1 : 1)
        break
      case 'ArrowLeft':
        if (vertical) return
        event.preventDefault()
        ctx.move(rtl ? 1 : -1)
        break
      case 'ArrowDown':
        event.preventDefault()
        ctx.move(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        ctx.move(-1)
        break
      case 'Home':
        event.preventDefault()
        ctx.focusAt(0)
        break
      case 'End': {
        event.preventDefault()
        const last = ctx.enabled().length - 1
        ctx.focusAt(last)
        break
      }
      default:
        break
    }
  }
</script>

<div
  data-slot="toolbar"
  role="toolbar"
  data-orientation={orientation}
  data-disabled={disabled ? '' : undefined}
  onkeydown={handleKeydown}
  class={cn(
    'bg-background flex w-fit items-center gap-1 rounded-lg border p-1',
    'max-h-full max-w-full scrollbar-none overflow-auto *:shrink-0 [&::-webkit-scrollbar]:hidden',
    'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
