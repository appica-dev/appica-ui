import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import PopoverHost from './popover.test-host.svelte'

describe('Popover', () => {
  it('renders the trigger and tags it with data-slot', () => {
    render(PopoverHost)
    const trigger = screen.getByRole('button', { name: 'Open' })
    expect(trigger.getAttribute('data-slot')).toBe('popover-trigger')
  })

  it('does not render content before being opened', () => {
    render(PopoverHost, { props: { description: 'Hidden until click' } })
    expect(screen.queryByText('Hidden until click')).toBeNull()
  })

  it('keeps the content mounted while closed when keepMounted is set', () => {
    render(PopoverHost, { props: { keepMounted: true, description: 'Always in the DOM' } })
    expect(document.querySelector('[data-slot="popover-content"]')).not.toBeNull()
    expect(screen.getByText('Always in the DOM')).toBeInTheDocument()
  })

  it('opens on click and closes on Escape', async () => {
    const user = userEvent.setup()
    render(PopoverHost)

    await user.click(screen.getByRole('button', { name: 'Open' }))
    const description = await screen.findByText('You are all caught up.')
    expect(description).toBeTruthy()

    const popup = description.closest('[data-slot="popover-content"]') as HTMLElement
    expect(popup).not.toBeNull()
    expect(popup.className).toContain('bg-background')
    expect(popup.className).toContain('rounded-xl')

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('You are all caught up.')).toBeNull()
    })
  })

  it('closes when PopoverClose is clicked', async () => {
    const user = userEvent.setup()
    render(PopoverHost)

    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByText('You are all caught up.')

    const close = document.querySelector('[data-slot="popover-close"]') as HTMLElement
    expect(close).not.toBeNull()
    await user.click(close)
    await waitFor(() => {
      expect(screen.queryByText('You are all caught up.')).toBeNull()
    })
  })

  it('renders the title with intense foreground styles', async () => {
    const user = userEvent.setup()
    render(PopoverHost, { props: { title: 'Heading' } })
    await user.click(screen.getByRole('button', { name: 'Open' }))

    const title = await screen.findByText('Heading')
    expect(title.getAttribute('data-slot')).toBe('popover-title')
    expect(title.className).toContain('text-foreground-intense')
    expect(title.className).toContain('font-semibold')
  })

  it('renders the arrow svg inside the popup', async () => {
    const user = userEvent.setup()
    render(PopoverHost)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByText('You are all caught up.')

    const arrow = document.querySelector('[data-slot="popover-arrow"]') as HTMLElement | null
    expect(arrow).not.toBeNull()
    expect(arrow!.querySelector('svg')).not.toBeNull()
  })

  it('omits the arrow when arrow is false', async () => {
    const user = userEvent.setup()
    render(PopoverHost, { props: { arrow: false, description: 'No arrow here.' } })

    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByText('No arrow here.')

    expect(document.querySelector('[data-slot="popover-arrow"]')).toBeNull()
  })

  it('has no accessibility violations (closed state)', async () => {
    const { container } = render(PopoverHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
