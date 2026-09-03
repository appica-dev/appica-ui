import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import AccordionHost from './accordion.test-host.svelte'

describe('Accordion', () => {
  it('renders trigger with data-slot', () => {
    render(AccordionHost)
    const trigger = screen.getByRole('button', { name: 'First' })
    expect(trigger.getAttribute('data-slot')).toBe('accordion-trigger')
  })

  it('defaults closed: panels not in the DOM', () => {
    render(AccordionHost)
    expect(screen.queryByText('First body')).toBeNull()
    expect(screen.queryByText('Second body')).toBeNull()
  })

  it('opens on trigger click and closes on a second click', async () => {
    const user = userEvent.setup()
    render(AccordionHost)
    const trigger = screen.getByRole('button', { name: 'First' })

    await user.click(trigger)
    const panel = await screen.findByText('First body')
    expect(panel.closest('[data-slot="accordion-content"]')).not.toBeNull()

    await user.click(trigger)
    await waitFor(() => {
      expect(screen.queryByText('First body')).toBeNull()
    })
  })

  it('respects defaultValue', () => {
    render(AccordionHost, { props: { defaultValue: 'two' } })
    expect(screen.getByText('Second body')).toBeInTheDocument()
    expect(screen.queryByText('First body')).toBeNull()
  })

  it('disabled root prevents toggling', async () => {
    const user = userEvent.setup()
    render(AccordionHost, { props: { disabled: true } })
    const trigger = screen.getByRole('button', { name: 'First' })
    expect(trigger.getAttribute('data-disabled')).not.toBeNull()
    await user.click(trigger)
    expect(screen.queryByText('First body')).toBeNull()
  })

  it('disabled item prevents toggling for that item only', async () => {
    const user = userEvent.setup()
    render(AccordionHost, { props: { itemDisabled: true } })
    const first = screen.getByRole('button', { name: 'First' })
    const second = screen.getByRole('button', { name: 'Second' })
    expect(first.getAttribute('data-disabled')).not.toBeNull()
    await user.click(first)
    expect(screen.queryByText('First body')).toBeNull()
    await user.click(second)
    await screen.findByText('Second body')
  })

  it('single mode: opening a second item closes the first', async () => {
    const user = userEvent.setup()
    render(AccordionHost)
    await user.click(screen.getByRole('button', { name: 'First' }))
    await screen.findByText('First body')
    await user.click(screen.getByRole('button', { name: 'Second' }))
    await screen.findByText('Second body')
    await waitFor(() => {
      expect(screen.queryByText('First body')).toBeNull()
    })
  })

  it('multiple mode: both panels can be open at once', async () => {
    const user = userEvent.setup()
    render(AccordionHost, { props: { multiple: true } })
    await user.click(screen.getByRole('button', { name: 'First' }))
    await user.click(screen.getByRole('button', { name: 'Second' }))
    await screen.findByText('First body')
    await screen.findByText('Second body')
  })

  it('icon={false} renders no icon SVG', () => {
    render(AccordionHost, { props: { icon: false } })
    const trigger = screen.getByRole('button', { name: 'First' })
    expect(trigger.querySelector('[data-slot="accordion-icon"]')).toBeNull()
  })

  it('iconVariant="icon-box" wraps the icon in a styled box', () => {
    render(AccordionHost, { props: { iconVariant: 'icon-box' } })
    const trigger = screen.getByRole('button', { name: 'First' })
    const box = trigger.querySelector('[data-slot="accordion-trigger-icon-box"]')
    expect(box).not.toBeNull()
    expect(box?.querySelector('[data-slot="accordion-icon"]')).not.toBeNull()
  })

  it('iconPosition="start" renders the icon before the children', () => {
    render(AccordionHost, { props: { iconPosition: 'start' } })
    const trigger = screen.getByRole('button', { name: 'First' })
    const firstChild = trigger.firstElementChild
    expect(firstChild?.querySelector('[data-slot="accordion-icon"]')).not.toBeNull()
  })

  it('has no a11y violations when open', async () => {
    const { container } = render(AccordionHost, { props: { defaultValue: 'one' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
