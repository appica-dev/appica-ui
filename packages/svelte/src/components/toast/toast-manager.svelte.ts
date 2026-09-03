import { getContext, setContext, type Snippet } from 'svelte'
import { SvelteMap } from 'svelte/reactivity'
import type { HTMLButtonAttributes } from 'svelte/elements'
import type { ToastSwipeAxis } from './toast-swipe'

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export const TOAST_STATUS_ICONS = ['success', 'error', 'info', 'warning', 'loading'] as const

export type ToastStatusIcon = (typeof TOAST_STATUS_ICONS)[number]

export type ToastPayload = {
  /** Leading chrome: a status name, a snippet, or a fallback string. */
  icon?: ToastStatusIcon | Snippet | (string & {})
  thumbnail?: string
  thumbnailAlt?: string
}

export type ToastActionProps = Pick<HTMLButtonAttributes, 'onclick' | 'disabled' | 'class' | 'id'> & {
  children?: string
  onClick?: (event: MouseEvent) => void
}

export type ToastData<Data = ToastPayload> = {
  id: string
  title?: string
  description?: string
  timeout?: number
  /**
   * Opt this toast into a countdown bar, overriding the Toaster `progress` prop.
   */
  progress?: boolean
  /**
   * Discriminator for conditional chrome (for example promise loading/success/error).
   */
  type?: string
  /**
   * Screen-reader urgency. `high` is announced with `role="alert"`.
   * @default 'low'
   */
  priority?: 'low' | 'high'
  data?: Data
  actionProps?: ToastActionProps
  onClose?: () => void
  onRemove?: () => void
  height?: number
  updateKey?: number
  limited?: boolean
  swipeDirection?: ToastSwipeAxis
  /**
   * True while the exit animation is running. Set by `close()`, cleared by `remove()`.
   */
  closing?: boolean
}

export type AddToastOptions<Data = ToastPayload> = Omit<
  ToastData<Data>,
  'id' | 'closing' | 'limited' | 'updateKey' | 'height' | 'swipeDirection'
> & { id?: string }

export type ToastPromiseMessage<T = unknown, Data = ToastPayload> =
  | string
  | AddToastOptions<Data>
  | ((value: T) => string | AddToastOptions<Data>)

export type ToastPromiseMessages<T = unknown, Data = ToastPayload> = {
  loading: ToastPromiseMessage<unknown, Data>
  success: ToastPromiseMessage<T, Data>
  error: ToastPromiseMessage<unknown, Data>
}

export type ToastManagerOptions = {
  timeout?: number
  limit?: number
}

export type ToastManager<Data = ToastPayload> = {
  readonly toasts: ToastData<Data>[]
  readonly timeout: number
  readonly limit: number
  readonly timersPaused: boolean
  add: (options: AddToastOptions<Data>) => string
  close: (id?: string, swipeDirection?: ToastSwipeAxis) => void
  /** Drop a toast immediately, skipping the exit animation. */
  remove: (id: string) => void
  update: (id: string, options: Partial<AddToastOptions<Data>>) => void
  promise: <T>(work: Promise<T>, messages: ToastPromiseMessages<T, Data>) => Promise<T>
  pauseTimers: () => void
  resumeTimers: () => void
  setHeight: (id: string, height: number) => void
  configure: (options: ToastManagerOptions) => void
}

const KEY = Symbol('appica-toast-manager')
const DEFAULT_TIMEOUT = 5000
const DEFAULT_LIMIT = 3
/** Matches toast CSS `transform` / `opacity` duration (0.5s). */
const EXIT_MS = 500

function exitAnimationMs() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0
  if (document.documentElement.hasAttribute('data-disable-animations')) return 0
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 0
  return EXIT_MS
}

let idCount = 0

export function isToastStatusIcon(value: string): value is ToastStatusIcon {
  return (TOAST_STATUS_ICONS as readonly string[]).includes(value)
}

export function isToastIconSnippet(value: unknown): value is Snippet {
  return typeof value === 'function'
}

function resolvePromiseMessage<T, Data>(message: ToastPromiseMessage<T, Data>, value?: T): AddToastOptions<Data> {
  const resolved = typeof message === 'function' ? message(value as T) : message
  return typeof resolved === 'string' ? { title: resolved } : resolved
}

type TimerEntry = {
  handle?: ReturnType<typeof setTimeout>
  start: number
  delay: number
  remaining: number
  callback: () => void
}

function applyLimited<Data>(list: ToastData<Data>[], limit: number): ToastData<Data>[] {
  let activeIndex = 0
  return list.map((toast) => {
    if (toast.closing) return toast
    const limited = activeIndex >= limit
    activeIndex += 1
    if (toast.limited === limited) return toast
    return { ...toast, limited }
  })
}

export function createToastManager<Data = ToastPayload>(options: ToastManagerOptions = {}): ToastManager<Data> {
  let items = $state<ToastData<Data>[]>([])
  let timeout = $state(options.timeout ?? DEFAULT_TIMEOUT)
  let limit = $state(options.limit ?? DEFAULT_LIMIT)
  let timersPaused = false
  const timers = new SvelteMap<string, TimerEntry>()
  const exitTimers = new SvelteMap<string, ReturnType<typeof setTimeout>>()

  function setItems(next: ToastData<Data>[]) {
    items = applyLimited(next, limit)
  }

  function clearDismissTimer(id: string) {
    const timer = timers.get(id)
    if (!timer) return
    if (timer.handle) clearTimeout(timer.handle)
    timers.delete(id)
    if (timers.size === 0) timersPaused = false
  }

  function clearExitTimer(id: string) {
    const handle = exitTimers.get(id)
    if (!handle) return
    clearTimeout(handle)
    exitTimers.delete(id)
  }

  function scheduleDismiss(id: string, delay: number) {
    clearDismissTimer(id)
    if (delay <= 0) return
    const current = items.find((toast) => toast.id === id)
    if (!current || current.closing || current.type === 'loading') return
    const start = Date.now()
    const entry: TimerEntry = {
      start,
      delay,
      remaining: delay,
      callback: () => close(id),
    }
    if (!timersPaused) {
      entry.handle = setTimeout(() => {
        timers.delete(id)
        if (timers.size === 0) timersPaused = false
        close(id)
      }, delay)
    }
    timers.set(id, entry)
  }

  function scheduleExit(id: string) {
    clearExitTimer(id)
    const ms = exitAnimationMs()
    if (ms <= 0) {
      remove(id)
      return
    }
    exitTimers.set(
      id,
      setTimeout(() => {
        exitTimers.delete(id)
        remove(id)
      }, ms),
    )
  }

  function close(id?: string, swipeDirection?: ToastSwipeAxis) {
    if (id === undefined) {
      const closingIds = items.filter((toast) => !toast.closing).map((toast) => toast.id)
      if (closingIds.length === 0) return
      for (const toast of items) {
        if (!toast.closing) toast.onClose?.()
      }
      for (const toastId of closingIds) {
        clearDismissTimer(toastId)
      }
      setItems(
        items.map((toast) =>
          toast.closing ? toast : { ...toast, closing: true, height: 0, swipeDirection: undefined },
        ),
      )
      for (const toastId of closingIds) scheduleExit(toastId)
      return
    }

    const current = items.find((toast) => toast.id === id)
    if (!current || current.closing) return
    clearDismissTimer(id)
    current.onClose?.()
    setItems(
      items.map((toast) =>
        toast.id === id
          ? { ...toast, closing: true, height: 0, swipeDirection: swipeDirection ?? toast.swipeDirection }
          : toast,
      ),
    )
    scheduleExit(id)
  }

  function remove(id: string) {
    clearDismissTimer(id)
    clearExitTimer(id)
    const current = items.find((toast) => toast.id === id)
    if (!current) return
    current.onRemove?.()
    setItems(items.filter((toast) => toast.id !== id))
  }

  function add(addOptions: AddToastOptions<Data>) {
    const id = addOptions.id ?? `toast-${++idCount}`
    const existing = items.find((toast) => toast.id === id)
    if (existing) {
      if (existing.closing) {
        remove(id)
      } else {
        update(id, addOptions, { resetTimer: true, bumpKey: true })
        return id
      }
    }
    const toast: ToastData<Data> = { ...addOptions, id, updateKey: 0 }
    setItems([toast, ...items])
    const duration = toast.timeout ?? timeout
    if (toast.type !== 'loading' && duration > 0) {
      scheduleDismiss(id, duration)
    }
    return id
  }

  function update(
    id: string,
    updateOptions: Partial<AddToastOptions<Data>>,
    flags: { resetTimer?: boolean; bumpKey?: boolean } = {},
  ) {
    const current = items.find((toast) => toast.id === id)
    if (!current || current.closing) return
    const next: ToastData<Data> = {
      ...current,
      ...updateOptions,
      id,
      closing: current.closing,
      limited: current.limited,
      height: current.height,
      swipeDirection: current.swipeDirection,
      updateKey: flags.bumpKey ? (current.updateKey ?? 0) + 1 : current.updateKey,
    }
    setItems(items.map((toast) => (toast.id === id ? next : toast)))
    const nextTimeout = next.timeout ?? timeout
    const shouldHaveTimer = next.type !== 'loading' && nextTimeout > 0
    const timeoutChanged = Object.hasOwn(updateOptions, 'timeout') || current.type === 'loading'
    if (!shouldHaveTimer) {
      clearDismissTimer(id)
      return
    }
    if (flags.resetTimer || timeoutChanged || !timers.has(id)) {
      scheduleDismiss(id, nextTimeout)
    }
  }

  function promise<T>(work: Promise<T>, messages: ToastPromiseMessages<T, Data>): Promise<T> {
    const loading = resolvePromiseMessage(messages.loading)
    const id = add({ timeout: 0, ...loading, type: loading.type ?? 'loading' })
    return work.then(
      (value) => {
        const success = resolvePromiseMessage(messages.success, value)
        update(
          id,
          { timeout, ...success, type: success.type ?? 'success' },
          { resetTimer: true, bumpKey: true },
        )
        return value
      },
      (error: unknown) => {
        const failed = resolvePromiseMessage(messages.error, error)
        update(
          id,
          { timeout, ...failed, type: failed.type ?? 'error' },
          { resetTimer: true, bumpKey: true },
        )
        throw error
      },
    )
  }

  function pauseTimers() {
    if (timersPaused) return
    timersPaused = true
    const now = Date.now()
    for (const timer of timers.values()) {
      if (!timer.handle) continue
      clearTimeout(timer.handle)
      timer.handle = undefined
      timer.remaining = Math.max(timer.remaining - (now - timer.start), 0)
    }
  }

  function resumeTimers() {
    if (!timersPaused) return
    timersPaused = false
    const now = Date.now()
    for (const [id, timer] of timers) {
      timer.remaining = timer.remaining > 0 ? timer.remaining : timer.delay
      timer.start = now
      timer.handle = setTimeout(() => {
        timers.delete(id)
        if (timers.size === 0) timersPaused = false
        timer.callback()
      }, timer.remaining)
    }
  }

  function setHeight(id: string, height: number) {
    const current = items.find((toast) => toast.id === id)
    if (!current || current.closing || current.height === height) return
    items = items.map((toast) => (toast.id === id ? { ...toast, height } : toast))
  }

  function configure(next: ToastManagerOptions) {
    if (next.timeout !== undefined && next.timeout !== timeout) timeout = next.timeout
    if (next.limit !== undefined && next.limit !== limit) {
      limit = next.limit
      items = applyLimited(items, limit)
    }
  }

  return {
    get toasts() {
      return items
    },
    get timeout() {
      return timeout
    },
    get limit() {
      return limit
    },
    get timersPaused() {
      return timersPaused
    },
    add,
    close,
    remove,
    update,
    promise,
    pauseTimers,
    resumeTimers,
    setHeight,
    configure,
  }
}

export function setToastManager<Data = ToastPayload>(manager: ToastManager<Data>) {
  setContext(KEY, manager)
}

export function useToastManager<Data = ToastPayload>(): ToastManager<Data> {
  const ctx = getContext<ToastManager<Data>>(KEY)
  if (!ctx) {
    throw new Error('useToastManager must be used within <ToastProvider>')
  }
  return ctx
}
