import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Chip, ChipGroup, type ChipGroupHandle } from './chip'

describe('Chip', () => {
  it('renders as a button by default with data-slot', () => {
    render(<Chip>Tag</Chip>)
    const el = screen.getByRole('button', { name: 'Tag' })
    expect(el.tagName).toBe('BUTTON')
    expect(el).toHaveAttribute('data-slot', 'chip')
  })

  it('renders as an anchor via render prop', () => {
    render(<Chip render={<a href="/x" />}>Link chip</Chip>)
    const el = screen.getByRole('link', { name: 'Link chip' })
    expect(el.tagName).toBe('A')
    expect(el).toHaveAttribute('href', '/x')
  })

  it('exposes state to a render callback', () => {
    render(
      <Chip
        variant="primary"
        size="lg"
        render={(props, state) => (
          <button
            type="button"
            {...props}
            data-test-variant={state.variant}
            data-test-size={state.size}
            data-test-dismissible={String(state.dismissible)}
          />
        )}
      >
        Done
      </Chip>,
    )
    const el = screen.getByRole('button', { name: 'Done' })
    expect(el).toHaveAttribute('data-test-variant', 'primary')
    expect(el).toHaveAttribute('data-test-size', 'lg')
    expect(el).toHaveAttribute('data-test-dismissible', 'false')
  })

  it('forwards className alongside variant + size classes', () => {
    render(
      <Chip className="my-chip" variant="destructive" size="sm">
        Hi
      </Chip>,
    )
    const el = screen.getByRole('button', { name: 'Hi' })
    expect(el.className).toContain('my-chip')
    expect(el.className).toContain('bg-error')
    expect(el.className).toContain('h-6')
  })

  it('uses soft variant and md size by default', () => {
    render(<Chip>Default</Chip>)
    const el = screen.getByRole('button', { name: 'Default' })
    expect(el.className).toContain('h-8')
  })

  it('non-dismissible click invokes user onClick and does not unmount', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Chip onClick={onClick}>Click me</Chip>)

    await user.click(screen.getByRole('button', { name: 'Click me' }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('dismissible click removes the chip and fires onDismiss after exit', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(
      <Chip dismissible onDismiss={onDismiss}>
        Red
      </Chip>,
    )

    const chip = screen.getByRole('button', { name: /Red/ })
    await user.click(chip)

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Red/ })).toBeNull()
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })
  })

  it('calls user onClick before dismissing and respects preventDefault', async () => {
    const onDismiss = vi.fn()
    const user = userEvent.setup()
    render(
      <Chip
        dismissible
        onDismiss={onDismiss}
        onClick={(event) => {
          event.preventDefault()
        }}
      >
        Blocked
      </Chip>,
    )

    await user.click(screen.getByRole('button', { name: /Blocked/ }))
    // preventDefault should stop the dismiss path entirely.
    expect(screen.getByRole('button', { name: /Blocked/ })).toBeInTheDocument()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('exposes closeLabel as sr-only text inside the chip', () => {
    render(
      <Chip dismissible closeLabel="Remove filter">
        Color: Red
      </Chip>,
    )
    expect(screen.getByText('Remove filter')).toHaveClass('sr-only')
  })

  it('controlled mode: open=false keeps the chip unmounted', () => {
    render(
      <Chip dismissible open={false}>
        Hidden
      </Chip>,
    )
    expect(screen.queryByRole('button', { name: /Hidden/ })).toBeNull()
  })

  it('controlled mode: fires onOpenChange(false) but parent keeps it open', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(
      <Chip dismissible open onOpenChange={onOpenChange}>
        Persistent
      </Chip>,
    )

    await user.click(screen.getByRole('button', { name: /Persistent/ }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole('button', { name: /Persistent/ })).toBeInTheDocument()
  })

  it('has no accessibility violations (default)', async () => {
    const { container } = render(<Chip>Accessible</Chip>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations (dismissible)', async () => {
    const { container } = render(<Chip dismissible>Accessible</Chip>)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ChipGroup', () => {
  it('renders with data-slot and wraps children', () => {
    render(
      <ChipGroup>
        <Chip>One</Chip>
        <Chip>Two</Chip>
      </ChipGroup>,
    )
    const group = screen.getByRole('button', { name: 'One' }).parentElement
    expect(group).toHaveAttribute('data-slot', 'chip-group')
  })

  it('passes variant + size defaults to descendant chips', () => {
    render(
      <ChipGroup variant="primary" size="lg">
        <Chip>Inherits</Chip>
        <Chip size="sm">Override</Chip>
      </ChipGroup>,
    )
    const inheritsChip = screen.getByRole('button', { name: 'Inherits' })
    const overrideChip = screen.getByRole('button', { name: 'Override' })

    expect(inheritsChip.className).toContain('bg-primary')
    expect(inheritsChip.className).toContain('h-10')
    expect(inheritsChip.className).toContain('text-base')

    // Override chip keeps its own size.
    expect(overrideChip.className).toContain('h-6')
    expect(overrideChip.className).toContain('text-xs')
  })

  it('clearAll() dismisses every dismissible chip and fires their onDismiss', async () => {
    const onDismissA = vi.fn()
    const onDismissB = vi.fn()
    const onDismissC = vi.fn()
    const ref = React.createRef<ChipGroupHandle>()

    render(
      <ChipGroup ref={ref}>
        <Chip dismissible onDismiss={onDismissA}>
          A
        </Chip>
        <Chip dismissible onDismiss={onDismissB}>
          B
        </Chip>
        <Chip dismissible onDismiss={onDismissC}>
          C
        </Chip>
      </ChipGroup>,
    )

    expect(screen.getByRole('button', { name: /A/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /B/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /C/ })).toBeInTheDocument()

    ref.current?.clearAll()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /A/ })).toBeNull()
      expect(screen.queryByRole('button', { name: /B/ })).toBeNull()
      expect(screen.queryByRole('button', { name: /C/ })).toBeNull()
      expect(onDismissA).toHaveBeenCalledTimes(1)
      expect(onDismissB).toHaveBeenCalledTimes(1)
      expect(onDismissC).toHaveBeenCalledTimes(1)
    })
  })

  it('clearAll() ignores non-dismissible chips', async () => {
    const ref = React.createRef<ChipGroupHandle>()
    render(
      <ChipGroup ref={ref}>
        <Chip>Static</Chip>
        <Chip dismissible>Dismissable</Chip>
      </ChipGroup>,
    )

    ref.current?.clearAll()

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Dismissable/ })).toBeNull()
    })
    // Non-dismissible chip is still around.
    expect(screen.getByRole('button', { name: 'Static' })).toBeInTheDocument()
  })
})
