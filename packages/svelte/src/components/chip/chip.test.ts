import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { textSnippet } from '../../test/snippet'
import ChipGroupHost from './chip-group.test-host.svelte'
import Chip from './chip.svelte'

describe('Chip', () => {
  it('renders as a button by default with data-slot', () => {
    render(Chip, { props: { children: textSnippet('Tag') } })
    const el = screen.getByRole('button', { name: 'Tag' })
    expect(el.tagName).toBe('BUTTON')
    expect(el).toHaveAttribute('data-slot', 'chip')
  })

  it('renders as an anchor when href is set', () => {
    render(Chip, { props: { href: '/x', children: textSnippet('Link chip') } })
    const el = screen.getByRole('link', { name: 'Link chip' })
    expect(el.tagName).toBe('A')
    expect(el).toHaveAttribute('href', '/x')
  })

  it('forwards class alongside variant + size classes', () => {
    render(Chip, { props: { class: 'my-chip', variant: 'destructive', size: 'sm', children: textSnippet('Hi') } })
    const el = screen.getByRole('button', { name: 'Hi' })
    expect(el.className).toContain('my-chip')
    expect(el.className).toContain('bg-error')
    expect(el.className).toContain('h-6')
  })

  it('uses soft variant and md size by default', () => {
    render(Chip, { props: { children: textSnippet('Default') } })
    const el = screen.getByRole('button', { name: 'Default' })
    expect(el.className).toContain('h-8')
  })

  it('non-dismissible click invokes user onclick and does not unmount', async () => {
    const onclick = vi.fn()
    const user = userEvent.setup()
    render(Chip, { props: { onclick, children: textSnippet('Click me') } })

    await user.click(screen.getByRole('button', { name: 'Click me' }))
    expect(onclick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('dismissible click removes the chip and fires onDismiss after exit', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(Chip, { props: { dismissible: true, onDismiss, children: textSnippet('Red') } })

    const chip = screen.getByRole('button', { name: /Red/ })
    await user.click(chip)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Red/ })).toBeNull()
    })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('calls user onclick before dismissing and respects preventDefault', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(Chip, {
      props: {
        dismissible: true,
        onDismiss,
        onclick: (event: MouseEvent) => {
          event.preventDefault()
        },
        children: textSnippet('Blocked'),
      },
    })

    await user.click(screen.getByRole('button', { name: /Blocked/ }))
    expect(screen.getByRole('button', { name: /Blocked/ })).toBeInTheDocument()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('exposes closeLabel as sr-only text inside the chip', () => {
    render(Chip, { props: { dismissible: true, closeLabel: 'Remove filter', children: textSnippet('Color: Red') } })
    expect(screen.getByText('Remove filter')).toHaveClass('sr-only')
  })

  it('controlled mode: open=false keeps the chip unmounted', () => {
    render(Chip, { props: { dismissible: true, open: false, children: textSnippet('Hidden') } })
    expect(screen.queryByRole('button', { name: /Hidden/ })).toBeNull()
  })

  it('controlled mode: fires onOpenChange(false) but parent keeps it open', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(Chip, { props: { dismissible: true, open: true, onOpenChange, children: textSnippet('Persistent') } })

    await user.click(screen.getByRole('button', { name: /Persistent/ }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole('button', { name: /Persistent/ })).toBeInTheDocument()
  })

  it('has no accessibility violations (default)', async () => {
    const { container } = render(Chip, { props: { children: textSnippet('Accessible') } })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations (dismissible)', async () => {
    const { container } = render(Chip, { props: { dismissible: true, children: textSnippet('Accessible') } })
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ChipGroup', () => {
  it('renders with data-slot and wraps children', () => {
    const { container } = render(ChipGroupHost, { props: { items: [{ label: 'One' }, { label: 'Two' }] } })
    expect(container.querySelector('[data-slot="chip-group"]')).not.toBeNull()
    expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument()
  })

  it('passes variant + size defaults to descendant chips', () => {
    render(ChipGroupHost, {
      props: {
        variant: 'primary',
        size: 'lg',
        items: [
          { label: 'Inherits' },
          { label: 'Override', size: 'sm' },
        ],
      },
    })
    const inheritsChip = screen.getByRole('button', { name: 'Inherits' })
    const overrideChip = screen.getByRole('button', { name: 'Override' })

    expect(inheritsChip.className).toContain('bg-primary')
    expect(inheritsChip.className).toContain('h-10')
    expect(inheritsChip.className).toContain('text-base')

    expect(overrideChip.className).toContain('h-6')
    expect(overrideChip.className).toContain('text-xs')
  })

  it('clearAll() dismisses every dismissible chip and fires their onDismiss', async () => {
    const onDismissA = vi.fn()
    const onDismissB = vi.fn()
    const onDismissC = vi.fn()

    const { component } = render(ChipGroupHost, {
      props: {
        items: [
          { label: 'A', dismissible: true, onDismiss: onDismissA },
          { label: 'B', dismissible: true, onDismiss: onDismissB },
          { label: 'C', dismissible: true, onDismiss: onDismissC },
        ],
      },
    })

    expect(screen.getByRole('button', { name: /A/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /B/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /C/ })).toBeInTheDocument()

    component.clearAll()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /A/ })).toBeNull()
      expect(screen.queryByRole('button', { name: /B/ })).toBeNull()
      expect(screen.queryByRole('button', { name: /C/ })).toBeNull()
    })

    expect(onDismissA).toHaveBeenCalledTimes(1)
    expect(onDismissB).toHaveBeenCalledTimes(1)
    expect(onDismissC).toHaveBeenCalledTimes(1)
  })

  it('clearAll() ignores non-dismissible chips', async () => {
    const { component } = render(ChipGroupHost, {
      props: {
        items: [{ label: 'Static' }, { label: 'Dismissable', dismissible: true }],
      },
    })

    component.clearAll()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Dismissable/ })).toBeNull()
    })
    expect(screen.getByRole('button', { name: 'Static' })).toBeInTheDocument()
  })
})
