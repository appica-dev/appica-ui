import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { createHandle } from '../../internal/overlay-handle.svelte'
import AlertDialogHost from './alert-dialog.test-host.svelte'
import { AlertDialog } from './index'

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })

describe('AlertDialog', () => {
  it('tags the trigger with data-slot', () => {
    render(AlertDialogHost)
    expect(screen.getByRole('button', { name: 'Delete' }).getAttribute('data-slot')).toBe('alert-dialog-trigger')
  })

  it('does not render content before being opened', () => {
    render(AlertDialogHost)
    expect(screen.queryByText('Everything in this project will be removed.')).toBeNull()
  })

  it('opens as role=alertdialog with no default close button', async () => {
    const user = setupUser()
    render(AlertDialogHost)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toHaveAccessibleName('Delete project')
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('closes from a footer close button', async () => {
    const user = setupUser()
    render(AlertDialogHost)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByRole('alertdialog')

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull()
    })
  })

  it('exposes createHandle', async () => {
    expect(typeof AlertDialog.createHandle).toBe('function')
    const handle = createHandle()
    render(AlertDialogHost, { props: { handle } })
    handle.open = true
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(AlertDialogHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
