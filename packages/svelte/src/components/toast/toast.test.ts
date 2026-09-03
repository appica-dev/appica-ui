import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import ToastHost from './toast.test-host.svelte'
import ToastManual from './toast.test-manual.svelte'
import ToastSnippet from './toast.test-snippet.svelte'
import ToastManaged from './toast.test-managed.svelte'
import { createToastManager, type ToastPosition } from './toast-manager.svelte'
import { attachToastSwipe, swipeDisplacement } from './toast-swipe'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('Toast', () => {
  it('renders title and description after add()', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0 } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    expect(await screen.findByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()
  })

  it('tags every sub-component with a data-slot attribute', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0, withAction: true, icon: 'success' } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    expect(document.querySelector('[data-slot="toast-viewport"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="toast"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="toast-icon"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="toast-title"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="toast-description"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="toast-actions"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="toast-action"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="toast-close"]')).not.toBeNull()
  })

  it('renders the close button by default and removes the toast on click', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0 } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    const close = document.querySelector<HTMLButtonElement>('[data-slot="toast-close"]')
    expect(close).toHaveAttribute('aria-label', 'Dismiss')
    expect(close).toHaveAttribute('aria-hidden', 'true')
    await user.click(close!)
    await waitFor(
      () => {
        expect(screen.queryByText('Hello')).toBeNull()
      },
      { timeout: 2000 },
    )
  })

  it.each<ToastPosition>(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'])(
    'applies position="%s" to viewport and toast root',
    async (position) => {
      const user = userEvent.setup()
      render(ToastHost, { props: { position, timeout: 0 } })
      await user.click(screen.getByRole('button', { name: 'Show toast' }))
      await screen.findByText('Hello')
      expect(document.querySelector('[data-slot="toast-viewport"]')).toHaveAttribute('data-position', position)
      expect(document.querySelector('[data-slot="toast"]')).toHaveAttribute('data-position', position)
    },
  )

  it('renders a progress bar when progress is enabled', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { progress: true, timeout: 10000 } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    expect(document.querySelector('[data-slot="toast-progress"]')).not.toBeNull()
  })

  it('renders a progress bar for a default-timeout toast when progress is enabled', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { progress: true } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    expect(document.querySelector('[data-slot="toast-progress"]')).not.toBeNull()
  })

  it('omits the progress bar by default', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 10000 } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    expect(document.querySelector('[data-slot="toast-progress"]')).toBeNull()
  })

  it('omits the progress bar when timeout is 0 even if progress is enabled', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { progress: true, timeout: 0 } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    expect(document.querySelector('[data-slot="toast-progress"]')).toBeNull()
  })

  it('sizes the toast to its content instead of a fixed 4.5rem shell', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0, withAction: true } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    expect(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument()
    const toast = document.querySelector('[data-slot="toast"]') as HTMLElement
    expect(toast.getAttribute('style')).not.toContain('4.5rem')
  })

  it('renders a built-in status icon', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0, icon: 'success' } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    expect(document.querySelector('[data-toast-status="success"]')).not.toBeNull()
  })

  it('renders a thumbnail when data.thumbnail is set', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0, thumbnail: 'https://example.com/photo.jpg' } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    expect(document.querySelector('[data-slot="thumbnail"]')).not.toBeNull()
  })

  it('updates a promise toast when the work resolves', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0, withPromise: true } })
    await user.click(screen.getByRole('button', { name: 'Promise toast' }))
    expect(await screen.findByText('Loading')).toBeInTheDocument()
    expect(await screen.findByText('Done')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('Loading')).toBeNull()
    })
  })

  it('shows a progress bar when the toast opts in', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 10000, toastProgress: true } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    expect(document.querySelector('[data-slot="toast-progress"]')).not.toBeNull()
  })

  it('fires actionProps.onclick when ToastAction is clicked', async () => {
    const onAction = vi.fn()
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0, withAction: true, onAction } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await user.click(await screen.findByRole('button', { name: 'Do it' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('renders multiple toasts when add is called more than once', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0 } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await waitFor(() => {
      expect(document.querySelectorAll('[data-slot="toast"]')).toHaveLength(2)
    })
  })

  it('marks toasts beyond the provider limit', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0, limit: 1 } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await waitFor(() => {
      expect(document.querySelectorAll('[data-slot="toast"]')).toHaveLength(2)
    })
    expect(document.querySelectorAll('[data-limited]')).toHaveLength(1)
  })

  it('exposes a notifications landmark and focuses it on F6', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0 } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    const viewport = document.querySelector('[data-slot="toast-viewport"]')
    expect(viewport).toHaveAttribute('role', 'region')
    expect(viewport).toHaveAttribute('aria-label', 'Notifications')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F6', bubbles: true }))
    expect(document.activeElement).toBe(viewport)
  })

  it('pauses auto-dismiss timers when F6 focuses the viewport', async () => {
    const manager = createToastManager({ timeout: 1000 })
    render(ToastManaged, { props: { manager } })
    manager.add({ title: 'Timed' })
    expect(await screen.findByText('Timed')).toBeInTheDocument()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F6', bubbles: true }))
    expect(manager.timersPaused).toBe(true)
  })

  it('renders a snippet passed through data.icon', async () => {
    const user = userEvent.setup()
    render(ToastSnippet)
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    expect(await screen.findByTestId('custom-icon')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="toast-icon"]')).toContainElement(screen.getByTestId('custom-icon'))
  })

  it('announces high-priority toasts with alertdialog and an alert live region', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0, priority: 'high' } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    const alert = await screen.findByRole('alert')
    expect(document.querySelector('[data-slot="toast"]')).toHaveAttribute('role', 'alertdialog')
    expect(alert).toHaveTextContent('Hello')
    expect(alert).toHaveTextContent('World')
  })

  it('dismisses a toast when swiped past the threshold', async () => {
    const manager = createToastManager()
    render(ToastManaged, { props: { manager } })
    const id = manager.add({ title: 'Swipe me', timeout: 0 })
    expect(await screen.findByText('Swipe me')).toBeInTheDocument()
    manager.close(id, 'right')
    expect(manager.toasts[0]?.closing).toBe(true)
    expect(manager.toasts[0]?.swipeDirection).toBe('right')
    await waitFor(() => {
      expect(document.querySelector('[data-slot="toast"]')).toHaveAttribute('data-swipe-direction', 'right')
    })
    await waitFor(
      () => {
        expect(screen.queryByText('Swipe me')).toBeNull()
      },
      { timeout: 2000 },
    )
  })

  it('ignores swipes that start on the close button', async () => {
    const user = userEvent.setup()
    render(ToastHost, { props: { timeout: 0 } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    const close = document.querySelector('[data-slot="toast-close"]') as HTMLButtonElement
    fireEvent.pointerDown(close, { button: 0, clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(close, { pointerId: 1, clientX: 160, clientY: 100 })
    fireEvent.pointerUp(close, { pointerId: 1, clientX: 160, clientY: 100 })
    expect(document.querySelector('[data-slot="toast"]')).not.toHaveAttribute('data-swipe-direction')
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('has no accessibility violations once a toast is shown', async () => {
    const user = userEvent.setup()
    const { container } = render(ToastHost, {
      props: { timeout: 0, withAction: true },
    })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Hello')
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Toast primitives (manual composition)', () => {
  it('honors explicit position on ToastViewport and renders multiple actions', async () => {
    const user = userEvent.setup()
    render(ToastManual)
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Manual')
    expect(document.querySelector('[data-slot="toast-viewport"]')).toHaveAttribute('data-position', 'top-left')
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('data-slot', 'toast-action')
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('data-slot', 'toast-action')
    const close = document.querySelector('[data-slot="toast-close"]')
    expect(close).not.toBeNull()
    expect(close).toHaveAttribute('aria-label', 'Close')
  })

  it('forwards class on root and sub-components', async () => {
    const user = userEvent.setup()
    render(ToastManual, { props: { extraClass: true } })
    await user.click(screen.getByRole('button', { name: 'Show toast' }))
    await screen.findByText('Manual')
    expect(document.querySelector('[data-slot="toast-viewport"]')?.className).toContain('vp-extra')
    expect(document.querySelector('[data-slot="toast"]')?.className).toContain('root-extra')
    expect(screen.getByText('Manual').className).toContain('title-extra')
    expect(screen.getByText('D').className).toContain('desc-extra')
  })
})

describe('createToastManager', () => {
  it('keeps a toast listed after close() until remove()', () => {
    const manager = createToastManager()
    const id = manager.add({ title: 'X', timeout: 0 })
    expect(manager.toasts).toHaveLength(1)
    manager.close(id)
    expect(manager.toasts).toHaveLength(1)
    expect(manager.toasts[0]?.closing).toBe(true)
    manager.remove(id)
    expect(manager.toasts).toHaveLength(0)
  })

  it('drops a toast immediately from remove()', () => {
    const manager = createToastManager()
    const id = manager.add({ title: 'X', timeout: 0 })
    manager.remove(id)
    expect(manager.toasts).toHaveLength(0)
  })

  it('upserts when add() reuses an id', () => {
    const manager = createToastManager()
    manager.add({ id: 'same', title: 'One', timeout: 0 })
    manager.add({ id: 'same', title: 'Two', timeout: 0 })
    expect(manager.toasts).toHaveLength(1)
    expect(manager.toasts[0]?.title).toBe('Two')
  })

  it('closes every toast when close() is called without an id', () => {
    const manager = createToastManager()
    manager.add({ title: 'A', timeout: 0 })
    manager.add({ title: 'B', timeout: 0 })
    manager.close()
    expect(manager.toasts.every((toast) => toast.closing)).toBe(true)
  })

  it('marks older toasts as limited past the cap', () => {
    const manager = createToastManager({ limit: 2 })
    manager.add({ title: 'A', timeout: 0 })
    manager.add({ title: 'B', timeout: 0 })
    manager.add({ title: 'C', timeout: 0 })
    expect(manager.toasts.map((toast) => toast.limited)).toEqual([false, false, true])
  })

  it('pauses and resumes auto-dismiss timers', () => {
    vi.useFakeTimers()
    const manager = createToastManager({ timeout: 1000 })
    manager.add({ title: 'X' })
    manager.pauseTimers()
    vi.advanceTimersByTime(5000)
    expect(manager.toasts[0]?.closing).toBeFalsy()
    manager.resumeTimers()
    vi.advanceTimersByTime(1000)
    expect(manager.toasts[0]?.closing).toBe(true)
  })

  it('fires onClose then onRemove', () => {
    const onClose = vi.fn()
    const onRemove = vi.fn()
    const manager = createToastManager()
    const id = manager.add({ title: 'X', timeout: 0, onClose, onRemove })
    manager.close(id)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onRemove).not.toHaveBeenCalled()
    manager.remove(id)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('updates an existing toast in place', () => {
    const manager = createToastManager()
    const id = manager.add({ title: 'One', timeout: 0 })
    manager.update(id, { title: 'Two', description: 'Changed' })
    expect(manager.toasts).toHaveLength(1)
    expect(manager.toasts[0]?.title).toBe('Two')
    expect(manager.toasts[0]?.description).toBe('Changed')
  })

  it('accepts string shorthand for promise() states', async () => {
    const manager = createToastManager()
    const work = Promise.resolve('ok')
    const result = manager.promise(work, {
      loading: 'Working',
      success: 'Done',
      error: 'Fail',
    })
    expect(manager.toasts[0]?.title).toBe('Working')
    await result
    expect(manager.toasts[0]?.title).toBe('Done')
    expect(manager.toasts[0]?.type).toBe('success')
  })

  it('drives toasts from an external manager passed as toastManager', async () => {
    const manager = createToastManager()
    render(ToastManaged, { props: { manager } })
    manager.add({ title: 'External', timeout: 0 })
    expect(await screen.findByText('External')).toBeInTheDocument()
  })
})

describe('swipeDisplacement', () => {
  it('returns the signed offset along each axis', () => {
    expect(swipeDisplacement('right', 40, 0)).toBe(40)
    expect(swipeDisplacement('left', -40, 0)).toBe(40)
    expect(swipeDisplacement('down', 0, 50)).toBe(50)
    expect(swipeDisplacement('up', 0, -50)).toBe(50)
    expect(swipeDisplacement('right', -10, 0)).toBe(-10)
  })
})

describe('attachToastSwipe', () => {
  it('calls onDismiss when pointer travel exceeds 40px', () => {
    const node = document.createElement('div')
    document.body.append(node)
    const onDismiss = vi.fn()
    const onCancel = vi.fn()
    const detach = attachToastSwipe(node, {
      get enabled() {
        return true
      },
      get directions() {
        return ['right']
      },
      onMove: vi.fn(),
      onDismiss,
      onCancel,
    })
    node.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: 0, clientY: 0, pointerId: 1 }))
    node.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 50, clientY: 0, pointerId: 1 }))
    node.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 50, clientY: 0, pointerId: 1 }))
    expect(onDismiss).toHaveBeenCalledWith('right', 50, 0)
    expect(onCancel).not.toHaveBeenCalled()
    detach()
    node.remove()
  })

  it('ignores pointerdown on buttons', () => {
    const node = document.createElement('div')
    const button = document.createElement('button')
    node.append(button)
    document.body.append(node)
    const onDismiss = vi.fn()
    const detach = attachToastSwipe(node, {
      get enabled() {
        return true
      },
      get directions() {
        return ['right']
      },
      onMove: vi.fn(),
      onDismiss,
      onCancel: vi.fn(),
    })
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: 0, clientY: 0, pointerId: 1 }))
    button.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 50, clientY: 0, pointerId: 1 }))
    button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 50, clientY: 0, pointerId: 1 }))
    expect(onDismiss).not.toHaveBeenCalled()
    detach()
    node.remove()
  })
})
