import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import DropdownMenuHost from './dropdown-menu.test-host.svelte'

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })
const overlayText = { hidden: true as const }

describe('DropdownMenu', () => {
  it('does not render content before being opened', () => {
    render(DropdownMenuHost)
    expect(screen.queryByText('Profile')).toBeNull()
  })

  it('opens on trigger click and shows items', async () => {
    const user = setupUser()
    render(DropdownMenuHost)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const item = await screen.findByText('Profile', overlayText)
    expect(item.closest('[data-slot="dropdown-menu-item"]')).toHaveAttribute('role', 'menuitem')
  })

  it('closes on item click', async () => {
    const user = setupUser()
    render(DropdownMenuHost)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.click(await screen.findByText('Profile', overlayText))
    await waitFor(() => {
      expect(screen.queryByText('Profile', overlayText)).toBeNull()
    })
  })

  it('selects a radio item', async () => {
    const user = setupUser()
    render(DropdownMenuHost)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.click(await screen.findByText('Two', overlayText))
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const radio = (await screen.findByText('Two', overlayText)).closest('[data-slot="dropdown-menu-radio-item"]')
    expect(radio).toHaveAttribute('aria-checked', 'true')
  })

  it('opens a submenu', async () => {
    const user = setupUser()
    render(DropdownMenuHost)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.hover(await screen.findByText('More', overlayText))
    expect(await screen.findByText('Nested', overlayText)).toBeInTheDocument()
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(DropdownMenuHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
