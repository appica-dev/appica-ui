<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { cn } from '../../internal/utils'

  type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both'
  type ScrollbarVisibility = 'always' | 'auto' | 'never'

  const SCROLL_SHADOW_CLASSES = cn(
    'mask-no-repeat mask-intersect',
    'ltr:[mask-image:linear-gradient(to_bottom,transparent_0,black_min(40px,var(--scroll-area-overflow-y-start)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-y-end,40px))),transparent_100%),linear-gradient(to_right,transparent_0,black_min(40px,var(--scroll-area-overflow-x-start)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-x-end,40px))),transparent_100%)]',
    'rtl:[mask-image:linear-gradient(to_bottom,transparent_0,black_min(40px,var(--scroll-area-overflow-y-start)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-y-end,40px))),transparent_100%),linear-gradient(to_left,transparent_0,black_min(40px,var(--scroll-area-overflow-x-start)),black_calc(100%_-_min(40px,var(--scroll-area-overflow-x-end,40px))),transparent_100%)]',
  )

  const SCROLLBAR_AUTO_CLASSES = cn(
    'pointer-events-none opacity-0',
    'data-[hovering]:pointer-events-auto data-[hovering]:opacity-100',
    'data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-0',
  )

  const SCROLLBAR_CLASSES = cn(
    'absolute z-1 m-0.5 touch-none select-none',
    'transition-[width,height,opacity] duration-150 ease-out motion-reduce:transition-none',
    'data-[orientation=vertical]:inset-y-0 data-[orientation=vertical]:right-0 data-[orientation=vertical]:w-1.25',
    'data-[orientation=horizontal]:inset-x-0 data-[orientation=horizontal]:bottom-0 data-[orientation=horizontal]:h-1.25',
    'data-[orientation=vertical]:hover:w-2',
    'data-[orientation=horizontal]:hover:h-2',
  )

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Which axis (or axes) gets a scrollbar. `both` also renders the corner.
     * @default 'vertical'
     */
    orientation?: ScrollAreaOrientation
    /**
     * Fade the content at scrollable edges via a CSS mask.
     * @default false
     */
    scrollShadow?: boolean
    /**
     * `auto` reveals the bar on hover/scroll; `never` hides it while keeping content scrollable.
     * @default 'always'
     */
    scrollbarVisibility?: ScrollbarVisibility
    /** Props forwarded to the inner scroll viewport - `onscroll`, `class`, etc. */
    viewportProps?: HTMLAttributes<HTMLDivElement>
    children?: Snippet
  }

  let {
    orientation = 'vertical',
    scrollShadow = false,
    scrollbarVisibility = 'always',
    class: className,
    viewportProps,
    children,
    ...rest
  }: Props = $props()
  const viewportId = $props.id()

  let viewport: HTMLDivElement | undefined
  let hovering = $state(false)
  let scrolling = $state(false)
  let overflowYStart = $state(0)
  let overflowYEnd = $state(0)
  let overflowXStart = $state(0)
  let overflowXEnd = $state(0)
  let vThumb = $state({ size: 100, offset: 0 })
  let hThumb = $state({ size: 100, offset: 0 })
  let vValue = $state(0)
  let hValue = $state(0)
  let scrollTimer: ReturnType<typeof setTimeout> | undefined

  const showVertical = $derived(
    scrollbarVisibility !== 'never' && (orientation === 'vertical' || orientation === 'both'),
  )
  const showHorizontal = $derived(
    scrollbarVisibility !== 'never' && (orientation === 'horizontal' || orientation === 'both'),
  )
  const showCorner = $derived(orientation === 'both' && scrollbarVisibility !== 'never')

  function thumbMetrics(scroll: number, client: number, total: number) {
    if (total <= 0 || client >= total) return { size: 100, offset: 0 }
    const size = Math.max((client / total) * 100, 10)
    const maxScroll = total - client
    const offset = (scroll / maxScroll) * (100 - size)
    return { size, offset }
  }

  function sync() {
    const node = viewport
    if (!node) return
    overflowYStart = node.scrollTop
    overflowYEnd = Math.max(0, node.scrollHeight - node.clientHeight - node.scrollTop)
    overflowXStart = node.scrollLeft
    overflowXEnd = Math.max(0, node.scrollWidth - node.clientWidth - node.scrollLeft)
    vThumb = thumbMetrics(node.scrollTop, node.clientHeight, node.scrollHeight)
    hThumb = thumbMetrics(node.scrollLeft, node.clientWidth, node.scrollWidth)
    const yMax = node.scrollHeight - node.clientHeight
    const xMax = node.scrollWidth - node.clientWidth
    vValue = yMax > 0 ? Math.round((node.scrollTop / yMax) * 100) : 0
    hValue = xMax > 0 ? Math.round((node.scrollLeft / xMax) * 100) : 0
  }

  function attachViewport(node: HTMLDivElement) {
    return untrack(() => {
      viewport = node
      sync()
      const Observer = typeof ResizeObserver === 'undefined' ? undefined : ResizeObserver
      if (!Observer) {
        return () => {
          if (viewport === node) viewport = undefined
        }
      }
      const ro = new Observer(() => sync())
      ro.observe(node)
      if (node.firstElementChild) ro.observe(node.firstElementChild)
      return () => {
        ro.disconnect()
        if (viewport === node) viewport = undefined
      }
    })
  }

  function handleScroll(event: UIEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    sync()
    scrolling = true
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      scrolling = false
    }, 600)
    viewportProps?.onscroll?.(event)
  }

  function drag(axis: 'vertical' | 'horizontal', event: PointerEvent) {
    if (!viewport) return
    const viewportNode: HTMLDivElement = viewport
    event.preventDefault()
    event.stopPropagation()
    const trackEl = event.currentTarget as HTMLElement
    trackEl.setPointerCapture(event.pointerId)
    const startPos = axis === 'vertical' ? event.clientY : event.clientX
    const startScroll = axis === 'vertical' ? viewportNode.scrollTop : viewportNode.scrollLeft
    const track = axis === 'vertical' ? trackEl.clientHeight : trackEl.clientWidth
    const thumbSize = axis === 'vertical' ? vThumb.size : hThumb.size
    const maxScroll =
      axis === 'vertical'
        ? viewportNode.scrollHeight - viewportNode.clientHeight
        : viewportNode.scrollWidth - viewportNode.clientWidth
    const travel = track * (1 - thumbSize / 100)

    function move(ev: PointerEvent) {
      if (travel <= 0) return
      const pos = axis === 'vertical' ? ev.clientY : ev.clientX
      const next = startScroll + ((pos - startPos) / travel) * maxScroll
      if (axis === 'vertical') viewportNode.scrollTop = next
      else viewportNode.scrollLeft = next
    }

    function up() {
      trackEl.removeEventListener('pointermove', move)
      trackEl.removeEventListener('pointerup', up)
      trackEl.removeEventListener('pointercancel', up)
    }

    trackEl.addEventListener('pointermove', move)
    trackEl.addEventListener('pointerup', up)
    trackEl.addEventListener('pointercancel', up)
  }

  const overflowStyle = $derived(
    `--scroll-area-overflow-y-start: ${overflowYStart}px; --scroll-area-overflow-y-end: ${overflowYEnd}px; --scroll-area-overflow-x-start: ${overflowXStart}px; --scroll-area-overflow-x-end: ${overflowXEnd}px`,
  )
  const viewportStyle = $derived(
    [overflowStyle, typeof viewportProps?.style === 'string' ? viewportProps.style : undefined].filter(Boolean).join('; '),
  )
  const viewportClass = $derived(
    cn(
      'focus-visible:ring-ring min-h-0 w-full flex-1 rounded-[inherit] outline-none focus-visible:ring-2',
      'scrollbar-none [&::-webkit-scrollbar]:hidden',
      orientation === 'vertical' && 'overflow-y-auto overflow-x-hidden',
      orientation === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
      orientation === 'both' && 'overflow-auto',
      scrollShadow && SCROLL_SHADOW_CLASSES,
      viewportProps?.class,
    ),
  )
  const barClass = $derived(
    cn(SCROLLBAR_CLASSES, scrollbarVisibility === 'auto' && SCROLLBAR_AUTO_CLASSES),
  )
</script>

<div
  data-slot="scroll-area"
  class={cn('relative flex flex-col', className)}
  onpointerenter={() => (hovering = true)}
  onpointerleave={() => (hovering = false)}
  {...rest}
>
  <div
    {@attach attachViewport}
    id={viewportId}
    data-slot="scroll-area-viewport"
    {...viewportProps}
    class={viewportClass}
    style={viewportStyle}
    onscroll={handleScroll}
  >
    <div
      data-slot="scroll-area-content"
      style={orientation === 'vertical' ? 'min-width: 0' : 'min-width: fit-content'}
    >
      {@render children?.()}
    </div>
  </div>
  {#if showVertical}
    <div
      role="scrollbar"
      aria-orientation="vertical"
      aria-controls={viewportId}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={vValue}
      aria-label="Vertical scroll"
      tabindex="-1"
      data-slot="scroll-area-scrollbar"
      data-orientation="vertical"
      data-visibility={scrollbarVisibility}
      data-hovering={hovering ? '' : undefined}
      data-scrolling={scrolling ? '' : undefined}
      class={barClass}
      onpointerdown={(event) => drag('vertical', event)}
    >
      <div
        data-slot="scroll-area-thumb"
        data-orientation="vertical"
        class="bg-background-strong pointer-events-none absolute inset-x-0 rounded-full"
        style={`top: ${vThumb.offset}%; height: ${vThumb.size}%`}
      ></div>
    </div>
  {/if}
  {#if showHorizontal}
    <div
      role="scrollbar"
      aria-orientation="horizontal"
      aria-controls={viewportId}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={hValue}
      aria-label="Horizontal scroll"
      tabindex="-1"
      data-slot="scroll-area-scrollbar"
      data-orientation="horizontal"
      data-visibility={scrollbarVisibility}
      data-hovering={hovering ? '' : undefined}
      data-scrolling={scrolling ? '' : undefined}
      class={barClass}
      onpointerdown={(event) => drag('horizontal', event)}
    >
      <div
        data-slot="scroll-area-thumb"
        data-orientation="horizontal"
        class="bg-background-strong pointer-events-none absolute inset-y-0 rounded-full"
        style={`left: ${hThumb.offset}%; width: ${hThumb.size}%`}
      ></div>
    </div>
  {/if}
  {#if showCorner}
    <div data-slot="scroll-area-corner" class="absolute right-0 bottom-0 size-2"></div>
  {/if}
</div>
