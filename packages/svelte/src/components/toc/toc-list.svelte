<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getTocContext } from './toc-context'

  type Props = HTMLAttributes<HTMLUListElement> & { children?: Snippet }

  let { class: className, style, children, ...rest }: Props = $props()

  const ctx = getTocContext('TocList')
  const activeIds = $derived(ctx.activeIds())

  let listEl: HTMLUListElement | undefined = $state()
  let indicator = $state({ top: 0, height: 0, visible: false })
  let animate = $state(false)

  $effect(() => {
    const ids = activeIds
    const getLinkElement = ctx.getLinkElement
    const measure = () => {
      let top = Number.POSITIVE_INFINITY
      let bottom = Number.NEGATIVE_INFINITY
      for (const id of ids) {
        const link = getLinkElement(id)
        if (!link) continue
        top = Math.min(top, link.offsetTop)
        bottom = Math.max(bottom, link.offsetTop + link.offsetHeight)
      }
      const prev = untrack(() => indicator)
      if (bottom <= top) {
        if (prev.visible) indicator = { ...prev, visible: false }
        return
      }
      const height = bottom - top
      if (prev.visible && prev.top === top && prev.height === height) return
      indicator = { top, height, visible: true }
    }
    measure()
    const list = listEl
    if (!list || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(list)
    return () => resizeObserver.disconnect()
  })

  $effect(() => {
    if (indicator.visible) animate = true
  })

  const listStyle = $derived(
    `--toc-indicator-top: ${indicator.top}px; --toc-indicator-height: ${indicator.height}px;${style ? ` ${style}` : ''}`,
  )
</script>

<ul
  bind:this={listEl}
  data-slot="toc-list"
  role="list"
  class={cn(
    'border-border relative flex flex-col border-s',
    'before:pointer-events-none before:absolute before:-inset-s-px before:w-0.5',
    'before:top-(--toc-indicator-top) before:h-(--toc-indicator-height)',
    'before:bg-foreground-intense',
    'before:transition-opacity before:duration-300 before:ease-out',
    animate && 'before:transition-[top,height,opacity]',
    'motion-reduce:before:transition-none',
    indicator.visible ? 'before:opacity-100' : 'before:opacity-0',
    className,
  )}
  style={listStyle}
  {...rest}
>
  {@render children?.()}
</ul>
