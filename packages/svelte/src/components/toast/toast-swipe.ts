export type ToastSwipeAxis = 'up' | 'down' | 'left' | 'right'

const SWIPE_THRESHOLD = 40
const SWIPE_IGNORE_SELECTOR =
  'button,a,input,textarea,select,[role="button"],[data-swipe-ignore],[data-base-ui-swipe-ignore]'

export function swipeDisplacement(direction: ToastSwipeAxis, deltaX: number, deltaY: number) {
  switch (direction) {
    case 'up':
      return -deltaY
    case 'down':
      return deltaY
    case 'left':
      return -deltaX
    case 'right':
      return deltaX
    default: {
      const _never: never = direction
      return _never
    }
  }
}

export type ToastSwipeHandlers = {
  get enabled(): boolean
  get directions(): ToastSwipeAxis[]
  onMove: (deltaX: number, deltaY: number) => void
  onDismiss: (direction: ToastSwipeAxis, deltaX: number, deltaY: number) => void
  onCancel: () => void
}

export function attachToastSwipe(node: HTMLElement, handlers: ToastSwipeHandlers) {
  let pointerId: number | null = null
  let startX = 0
  let startY = 0
  let deltaX = 0
  let deltaY = 0
  let dragging = false

  function targetIsIgnored(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest(SWIPE_IGNORE_SELECTOR))
  }

  function onPointerDown(event: PointerEvent) {
    if (!handlers.enabled || event.button !== 0) return
    if (targetIsIgnored(event.target)) return
    const directions = handlers.directions
    if (directions.length === 0) return
    pointerId = event.pointerId
    startX = event.clientX
    startY = event.clientY
    deltaX = 0
    deltaY = 0
    dragging = true
    node.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event: PointerEvent) {
    if (!dragging || event.pointerId !== pointerId) return
    event.preventDefault()
    deltaX = event.clientX - startX
    deltaY = event.clientY - startY
    handlers.onMove(deltaX, deltaY)
  }

  function finish(event: PointerEvent) {
    if (!dragging || event.pointerId !== pointerId) return
    dragging = false
    pointerId = null
    const directions = handlers.directions
    let dismissed: ToastSwipeAxis | undefined
    for (const direction of directions) {
      if (swipeDisplacement(direction, deltaX, deltaY) > SWIPE_THRESHOLD) {
        dismissed = direction
        break
      }
    }
    if (dismissed) {
      handlers.onDismiss(dismissed, deltaX, deltaY)
      return
    }
    handlers.onCancel()
  }

  function onTouchMove(event: TouchEvent) {
    if (!dragging) return
    event.preventDefault()
  }

  node.addEventListener('pointerdown', onPointerDown)
  node.addEventListener('pointermove', onPointerMove)
  node.addEventListener('pointerup', finish)
  node.addEventListener('pointercancel', finish)
  node.addEventListener('touchmove', onTouchMove, { passive: false })

  return () => {
    node.removeEventListener('pointerdown', onPointerDown)
    node.removeEventListener('pointermove', onPointerMove)
    node.removeEventListener('pointerup', finish)
    node.removeEventListener('pointercancel', finish)
    node.removeEventListener('touchmove', onTouchMove)
  }
}
