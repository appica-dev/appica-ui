<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { useDirection } from '../../hooks/use-direction/use-direction'
  import { getToastViewContext, setToastViewContext } from './toast-position'
  import { viewportPositionClasses } from './toast-variants'
  import { useToastManager, type ToastPosition } from './toast-manager.svelte'

  export type ToastViewportProps = HTMLAttributes<HTMLDivElement> & {
    /**
     * Where the stack is anchored.
     * @default 'bottom-right'
     */
    position?: ToastPosition
    children?: Snippet
  }

  let { class: className, position: positionProp, children, onkeydown, onfocus, onblur, ...rest }: ToastViewportProps =
    $props()

  const parent = getToastViewContext()
  const manager = useToastManager()
  let hovering = $state(false)
  let focused = $state(false)
  let viewportEl: HTMLDivElement | undefined = $state()
  let prevFocusElement: Element | null = $state(null)
  const position = $derived(positionProp ?? parent.position)
  const expanded = $derived(hovering || focused)
  const highPriorityToasts = $derived(manager.toasts.filter((toast) => toast.priority === 'high' && !toast.closing))

  setToastViewContext({
    get position() {
      return position
    },
    get expanded() {
      return expanded
    },
    get focused() {
      return focused
    },
  })

  const direction = useDirection()
  const classes = $derived(
    cn(
      'group/toast-viewport pointer-events-none has-[[data-slot=toast]]:pointer-events-auto fixed z-50 w-90 max-w-[calc(100vw-2rem)] outline-none min-h-[var(--stack-collapsed,0px)] data-expanded:min-h-[var(--stack-expanded,0px)]',
      viewportPositionClasses[position],
      className,
    ),
  )

  function isFocusVisible(el: Element | null) {
    if (!el) return false
    try {
      return el.matches(':focus-visible')
    } catch {
      return false
    }
  }

  function expandFromHover() {
    hovering = true
    manager.pauseTimers()
  }

  function collapseFromHover() {
    hovering = false
    if (!focused) manager.resumeTimers()
  }

  function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onfocus?.(event)
    if (focused) return
    if (isFocusVisible(document.activeElement)) {
      focused = true
      manager.pauseTimers()
    }
  }

  function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onblur?.(event)
    if (!focused) return
    const next = event.relatedTarget
    if (next instanceof Node && viewportEl?.contains(next)) return
    focused = false
    if (!hovering) manager.resumeTimers()
  }

  function handleKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onkeydown?.(event)
    if (event.key === 'Tab' && event.shiftKey && event.target === viewportEl) {
      event.preventDefault()
      prevFocusElement instanceof HTMLElement
        ? prevFocusElement.focus({ preventScroll: true })
        : (document.activeElement instanceof HTMLElement && document.activeElement.blur())
    }
  }

  function handleGlobalKeyDown(event: KeyboardEvent) {
    if (event.key !== 'F6' || manager.toasts.length === 0) return
    if (event.target === viewportEl) return
    event.preventDefault()
    prevFocusElement = document.activeElement
    viewportEl?.focus({ preventScroll: true })
    focused = true
    manager.pauseTimers()
  }

  function handleWindowBlur(event: FocusEvent) {
    if (event.target !== window) return
    manager.pauseTimers()
  }

  function handleWindowFocus(event: FocusEvent) {
    if (event.relatedTarget) return
    const target = event.target
    if (target === window || !viewportEl?.contains(target as Node) || !isFocusVisible(document.activeElement)) {
      if (!hovering && !focused) manager.resumeTimers()
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeyDown} onblur={handleWindowBlur} onfocus={handleWindowFocus} />

<div
  bind:this={viewportEl}
  data-slot="toast-viewport"
  data-position={position}
  data-expanded={expanded ? '' : undefined}
  dir={direction.current}
  class={classes}
  role="region"
  aria-label="Notifications"
  aria-live="polite"
  aria-atomic="false"
  aria-relevant="additions text"
  tabindex="-1"
  {...rest}
  onmouseenter={expandFromHover}
  onmousemove={expandFromHover}
  onmouseleave={collapseFromHover}
  onfocus={handleFocus}
  onblur={handleBlur}
  onkeydown={handleKeyDown}
>
  {@render children?.()}
</div>

{#if !focused && highPriorityToasts.length > 0}
  <div class="sr-only">
    {#each highPriorityToasts as toast (toast.id)}
      <div role="alert" aria-atomic="true">
        <div>{toast.title}</div>
        <div>{toast.description}</div>
      </div>
    {/each}
  </div>
{/if}
