import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import PreviewCardHost from './preview-card.test-host.svelte'

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })
const overlayText = { hidden: true as const }

describe('PreviewCard', () => {
  const triggerName = { name: 'example.com' }

  it('renders the trigger as a link tagged with data-slot', () => {
    render(PreviewCardHost)
    const trigger = screen.getByRole('button', triggerName)
    expect(trigger.tagName).toBe('A')
    expect(trigger).toHaveAttribute('href', 'https://example.com')
    expect(trigger.getAttribute('data-slot')).toBe('preview-card-trigger')
  })

  it('does not render content before hover', () => {
    render(PreviewCardHost, { props: { body: 'Hidden until hover' } })
    expect(screen.queryByText('Hidden until hover')).toBeNull()
  })

  it('shows content on hover', async () => {
    const user = setupUser()
    render(PreviewCardHost)

    const trigger = screen.getByRole('button', { name: 'example.com' })
    await user.hover(trigger)

    const body = await screen.findByText('A short preview of the linked page.', overlayText)
    const popup = body.closest('[data-slot="preview-card-content"]') as HTMLElement
    expect(popup).not.toBeNull()
    expect(popup.className).toContain('bg-background')
    expect(popup.className).toContain('rounded-xl')
    expect(popup.className).toContain('border-border-overlay')

    trigger.focus()
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByText('A short preview of the linked page.', overlayText)).toBeNull()
    })
  })

  it('renders the arrow svg inside the popup', async () => {
    const user = setupUser()
    render(PreviewCardHost)
    await user.hover(screen.getByRole('button', { name: 'example.com' }))
    await screen.findByText('A short preview of the linked page.', overlayText)

    const arrow = document.querySelector('[data-slot="preview-card-arrow"]') as HTMLElement | null
    expect(arrow).not.toBeNull()
    expect(arrow!.querySelector('svg')).not.toBeNull()
  })

  it('omits the arrow when arrow is false', async () => {
    const user = setupUser()
    render(PreviewCardHost, { props: { arrow: false, body: 'No arrow here.' } })

    await user.hover(screen.getByRole('button', { name: 'example.com' }))
    await screen.findByText('No arrow here.', overlayText)

    expect(document.querySelector('[data-slot="preview-card-arrow"]')).toBeNull()
  })

  it('keeps the content mounted while closed when keepMounted is set', () => {
    render(PreviewCardHost, { props: { keepMounted: true, body: 'Always in the DOM' } })
    expect(document.querySelector('[data-slot="preview-card-content"]')).not.toBeNull()
    expect(screen.getByText('Always in the DOM')).toBeInTheDocument()
  })

  it('has no accessibility violations (closed state)', async () => {
    const { container } = render(PreviewCardHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
