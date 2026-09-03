<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { onMount, untrack } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getToastViewContext } from './toast-position'
  import { setToastItemContext } from './toast-item-context'
  import { swipeDirectionByPosition, toastGridClass, toastShellClass, toastSizeClass } from './toast-variants'
  import { useToastManager, type ToastData, type ToastPosition } from './toast-manager.svelte'
  import { attachToastSwipe, type ToastSwipeAxis } from './toast-swipe'
  import ToastClose from './toast-close.svelte'
  import ToastProgress from './toast-progress.svelte'

  export type ToastProps = HTMLAttributes<HTMLDivElement> & {
    /** The toast data from `toasts`. */
    toast: ToastData
    /** Override the anchor and default swipe directions for this toast. */
    position?: ToastPosition
    /**
     * Show the dismiss button.
     * @default true
     */
    dismissible?: boolean
    /**
     * Opt in to a countdown progress bar.
     * @default false
     */
    progress?: boolean
    /**
     * Provider default timeout used when the toast omits `timeout`.
     * @default 5000
     */
    providerTimeout?: number
    /**
     * Accessible label for the close button.
     * @default 'Dismiss'
     */
    closeLabel?: string
    /**
     * Direction(s) in which the toast can be swiped to dismiss.
     */
    swipeDirection?: ToastSwipeAxis | ToastSwipeAxis[]
    /** Stack index among visible toasts. */
    index?: number
    /** Measured height of this toast, in pixels. */
    ownHeight?: number
    /** Height of the frontmost toast, in pixels. */
    frontmostHeight?: number
    /** Cumulative height of toasts in front of this one, in pixels. */
    offsetY?: number
    /** Reports the measured content height to the manager. */
    onHeight?: (height: number) => void
    children?: Snippet
  }

  let {
    class: className,
    toast,
    position: positionProp,
    dismissible = true,
    progress = false,
    providerTimeout = 5000,
    closeLabel,
    swipeDirection,
    index = 0,
    ownHeight = 0,
    frontmostHeight = 0,
    offsetY = 0,
    onHeight,
    onkeydown,
    children,
    ...rest
  }: ToastProps = $props()

  const manager = useToastManager()
  const view = getToastViewContext()
  const position = $derived(positionProp ?? view.position)
  const resolvedTimeout = $derived(toast.timeout ?? providerTimeout)
  const showProgress = $derived(progress && resolvedTimeout > 0 && toast.type !== 'loading')
  const sized = $derived(ownHeight > 0)
  const classes = $derived(cn(toastShellClass(position, className), sized && toastSizeClass))
  const resolvedFront = $derived(frontmostHeight > 0 ? frontmostHeight : ownHeight)
  const directions = $derived(
    swipeDirection === undefined
      ? swipeDirectionByPosition[position]
      : Array.isArray(swipeDirection)
        ? swipeDirection
        : [swipeDirection],
  )
  const isHighPriority = $derived(toast.priority === 'high')

  let titleId = $state<string | undefined>()
  let descriptionId = $state<string | undefined>()
  let enterPhase = $state<'starting' | 'open'>('starting')
  let swipeX = $state(0)
  let swipeY = $state(0)
  let swiping = $state(false)

  const swipeMovementX = $derived(toast.closing && toast.swipeDirection ? swipeX : swiping ? swipeX : 0)
  const swipeMovementY = $derived(toast.closing && toast.swipeDirection ? swipeY : swiping ? swipeY : 0)

  setToastItemContext({
    get toast() {
      return toast
    },
    get titleId() {
      return titleId
    },
    get descriptionId() {
      return descriptionId
    },
    setTitleId(id) {
      titleId = id
    },
    setDescriptionId(id) {
      descriptionId = id
    },
  })

  onMount(() => {
    const open = () => {
      enterPhase = 'open'
    }
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(open)
    })
    const fallback = window.setTimeout(open, 50)
    return () => {
      window.clearTimeout(fallback)
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  })

  function onKeyDown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onkeydown?.(event)
    if (event.key !== 'Escape') return
    const active = document.activeElement
    if (!active || !event.currentTarget.contains(active)) return
    manager.close(toast.id)
  }

  function resumeAfterSwipe() {
    if (!view.expanded) manager.resumeTimers()
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  data-slot="toast"
  data-position={position}
  data-type={toast.type}
  data-expanded={view.expanded ? '' : undefined}
  data-starting-style={enterPhase === 'starting' && !toast.closing ? '' : undefined}
  data-ending-style={toast.closing ? '' : undefined}
  data-limited={toast.limited ? '' : undefined}
  data-swiping={swiping ? '' : undefined}
  data-swipe-direction={toast.swipeDirection}
  role={isHighPriority ? 'alertdialog' : 'dialog'}
  aria-modal="false"
  tabindex="0"
  aria-labelledby={titleId}
  aria-describedby={descriptionId}
  aria-hidden={isHighPriority && !view.focused ? 'true' : undefined}
  inert={toast.limited ? true : undefined}
  {...rest}
  class={classes}
  style="--toast-index: {index}; --toast-height: {ownHeight}px; --toast-frontmost-height: {resolvedFront}px; --toast-offset-y: {offsetY}px; --toast-swipe-movement-x: {swipeMovementX}px; --toast-swipe-movement-y: {swipeMovementY}px;{swiping
    ? ' transition: none;'
    : ''}"
  onkeydown={onKeyDown}
  {@attach (node) =>
    attachToastSwipe(node, {
      get enabled() {
        return !toast.limited && !toast.closing && directions.length > 0
      },
      get directions() {
        return directions
      },
      onMove(deltaX, deltaY) {
        swiping = true
        swipeX = deltaX
        swipeY = deltaY
        manager.pauseTimers()
      },
      onDismiss(direction, deltaX, deltaY) {
        swiping = false
        swipeX = deltaX
        swipeY = deltaY
        manager.close(toast.id, direction)
        resumeAfterSwipe()
      },
      onCancel() {
        swiping = false
        swipeX = 0
        swipeY = 0
        resumeAfterSwipe()
      },
    })}
>
  <div
    class={toastGridClass}
    {@attach (node) => {
      const report = untrack(() => onHeight)
      if (!report) return
      const publish = () => {
        if (toast.closing) return
        report(Math.round(node.offsetHeight))
      }
      const observer = new ResizeObserver(publish)
      observer.observe(node)
      publish()
      return () => observer.disconnect()
    }}
  >
    {@render children?.()}
    {#if dismissible}
      <ToastClose {closeLabel} />
    {/if}
  </div>
  {#if showProgress}
    {#key `${toast.id}-${toast.updateKey ?? 0}-${resolvedTimeout}`}
      <ToastProgress timeout={resolvedTimeout} />
    {/key}
  {/if}
</div>
