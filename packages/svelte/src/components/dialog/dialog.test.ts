import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { createHandle } from '../../internal/overlay-handle.svelte'
import DialogHost from './dialog.test-host.svelte'
import { Dialog } from './index'

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })

describe('Dialog', () => {
  it('tags the trigger with data-slot', () => {
    render(DialogHost)
    expect(screen.getByRole('button', { name: 'Open dialog' }).getAttribute('data-slot')).toBe('dialog-trigger')
  })

  it('does not render content before being opened', () => {
    render(DialogHost)
    expect(screen.queryByText('Body content')).toBeNull()
  })

  it('opens on trigger click and exposes a labeled dialog', async () => {
    const user = setupUser()
    render(DialogHost)

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAccessibleName('Update profile')
    expect(dialog).toHaveAccessibleDescription('Make changes to your account.')
    expect(dialog.getAttribute('data-slot')).toBe('dialog-popup')
  })

  it('closes when the built-in close button is clicked', async () => {
    const user = setupUser()
    render(DialogHost)

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('closes when a DialogClose action is clicked', async () => {
    const user = setupUser()
    render(DialogHost)

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('closes on Escape', async () => {
    const user = setupUser()
    render(DialogHost)

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    await screen.findByRole('dialog')

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('hides the built-in close button when closeButton is false', async () => {
    const user = setupUser()
    render(DialogHost, { props: { closeButton: false } })

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    await screen.findByRole('dialog')

    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('renders a backdrop by default', async () => {
    const user = setupUser()
    render(DialogHost)

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    await screen.findByRole('dialog')

    expect(document.querySelector('[data-slot="dialog-backdrop"]')).not.toBeNull()
  })

  it('omits the backdrop when backdrop is false', async () => {
    const user = setupUser()
    render(DialogHost, { props: { backdrop: false } })

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    await screen.findByRole('dialog')

    expect(document.querySelector('[data-slot="dialog-backdrop"]')).toBeNull()
  })

  it('drops the frame when backdrop is off', async () => {
    const user = setupUser()
    render(DialogHost, { props: { backdrop: false, frame: true } })

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))
    await screen.findByRole('dialog')

    expect(document.querySelector('[data-slot="dialog-popup"]')).not.toHaveAttribute('data-frame')
  })

  it('exposes createHandle and opens programmatically', async () => {
    expect(typeof Dialog.createHandle).toBe('function')
    const handle = createHandle()
    render(DialogHost, { props: { handle } })
    expect(screen.queryByRole('dialog')).toBeNull()
    handle.open = true
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(DialogHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
