import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import AlertHost from './alert.test-host.svelte'
import AlertBindHost from './alert.bind.test-host.svelte'
import type { AlertVariant } from './alert-variants'

const TITLE = 'System message'
const DESCRIPTION = 'This is a short informational message.'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Alert', () => {
  it('renders with role="alert" and tags root with data-slot', () => {
    render(AlertHost)
    const root = screen.getByRole('alert')
    expect(root).toHaveAttribute('data-slot', 'alert')
    expect(root).toHaveAttribute('data-layout', 'block')
  })

  it('renders all sub-component slots', () => {
    render(AlertHost)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText(TITLE)).toHaveAttribute('data-slot', 'alert-title')
    expect(screen.getByText(DESCRIPTION)).toHaveAttribute('data-slot', 'alert-description')
    expect(screen.getByRole('button', { name: 'Action' }).parentElement).toHaveAttribute('data-slot', 'alert-action')
  })

  it('applies variant + layout classes', () => {
    render(AlertHost, { props: { variant: 'success', layout: 'inline' } })
    const root = screen.getByRole('alert')
    expect(root.className).toContain('bg-success-subtle')
    expect(root.className).toContain('border-success-soft')
    expect(root).toHaveAttribute('data-layout', 'inline')
  })

  it.each([
    ['default', 'text-foreground-intense'],
    ['primary', 'text-primary'],
    ['secondary', 'text-secondary-emphasis'],
    ['error', 'text-error-emphasis'],
    ['success', 'text-success-emphasis'],
    ['warning', 'text-warning-emphasis'],
    ['info', 'text-info-emphasis'],
  ] as const)('AlertIcon picks up %s color from variant', (variant, expected) => {
    render(AlertHost, { props: { variant } })
    const icon = screen.getByTestId('icon').parentElement
    expect(icon).toHaveAttribute('data-slot', 'alert-icon')
    expect(icon?.className).toContain(expected)
  })

  it('does not render the close button unless dismissible', () => {
    render(AlertHost)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()
  })

  it('renders the close button when dismissible and removes the alert on click', async () => {
    const user = userEvent.setup()
    render(AlertHost, { props: { dismissible: true } })

    const close = screen.getByRole('button', { name: 'Dismiss' })
    expect(close).toHaveAttribute('data-slot', 'alert-close')

    await user.click(close)
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  it('honors a custom closeLabel', () => {
    render(AlertHost, { props: { dismissible: true, closeLabel: 'Close banner' } })
    expect(screen.getByRole('button', { name: 'Close banner' })).toBeInTheDocument()
  })

  it('fires onOpenChange(false) when dismissed', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(AlertHost, { props: { dismissible: true, onOpenChange } })

    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('respects controlled `open` prop', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    const { rerender } = render(AlertHost, {
      props: { dismissible: true, open: true, onOpenChange, showIcon: false, showAction: false, showDescription: false },
    })

    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenCalledWith(false)

    await rerender({
      dismissible: true,
      open: false,
      onOpenChange,
      showIcon: false,
      showAction: false,
      showDescription: false,
    })
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  it('closes via bind:open without onOpenChange', async () => {
    const user = userEvent.setup()
    render(AlertBindHost)

    expect(screen.getByTestId('bound-open')).toHaveTextContent('true')

    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull()
    })
    expect(screen.getByTestId('bound-open')).toHaveTextContent('false')
  })

  it('persists dismissal via persistKey across remounts (localStorage)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(AlertHost, { props: { dismissible: true, persistKey: 'test-banner' } })

    const close = await screen.findByRole('button', { name: 'Dismiss' })
    await user.click(close)
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull()
    })

    unmount()
    render(AlertHost, { props: { dismissible: true, persistKey: 'test-banner' } })

    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  it('does not persist when persistKey is omitted', async () => {
    const user = userEvent.setup()
    const { unmount } = render(AlertHost, { props: { dismissible: true } })

    await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    await waitFor(() => {
      expect(screen.queryByRole('alert')).toBeNull()
    })

    unmount()
    render(AlertHost, { props: { dismissible: true } })
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('forwards class on root and sub-components', () => {
    render(AlertHost, {
      props: {
        class: 'root-extra',
        variant: 'error',
        iconClass: 'icon-extra',
        titleClass: 'title-extra',
        descClass: 'desc-extra',
        actionClass: 'action-extra',
        actionLabel: 'A',
      },
    })

    expect(screen.getByRole('alert').className).toContain('root-extra')
    expect(screen.getByTestId('icon').parentElement?.className).toContain('icon-extra')
    expect(screen.getByText(TITLE).className).toContain('title-extra')
    expect(screen.getByText(DESCRIPTION).className).toContain('desc-extra')
    expect(screen.getByRole('button', { name: 'A' }).parentElement?.className).toContain('action-extra')
  })

  it.each(['default', 'primary', 'secondary', 'error', 'success', 'warning', 'info'] as const)(
    '%s variant has no accessibility violations',
    async (variant: AlertVariant) => {
      const { container } = render(AlertHost, { props: { variant, dismissible: true } })
      expect(await axe(container)).toHaveNoViolations()
    },
  )
})
