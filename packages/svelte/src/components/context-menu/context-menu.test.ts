import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import ContextMenuHost from './context-menu.test-host.svelte'

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })
const overlayText = { hidden: true as const }

async function openMenu() {
  const user = setupUser()
  render(ContextMenuHost)
  await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
  return user
}

describe('ContextMenu', () => {
  it('does not render content before being opened', () => {
    render(ContextMenuHost)
    expect(screen.queryByText('Profile')).toBeNull()
  })

  it('opens on right click and shows items', async () => {
    await openMenu()
    const item = await screen.findByText('Profile', overlayText)
    expect(item.closest('[data-slot="context-menu-item"]')).toHaveAttribute('role', 'menuitem')
  })

  it('closes on item click', async () => {
    const user = await openMenu()
    await user.click(await screen.findByText('Profile', overlayText))
    await waitFor(() => {
      expect(screen.queryByText('Profile', overlayText)).toBeNull()
    })
  })

  it('selects a radio item', async () => {
    const user = await openMenu()
    await user.click(await screen.findByText('Two', overlayText))
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    const radio = (await screen.findByText('Two', overlayText)).closest('[data-slot="context-menu-radio-item"]')
    expect(radio).toHaveAttribute('aria-checked', 'true')
  })

  it('opens a submenu', async () => {
    const user = await openMenu()
    await user.hover(await screen.findByText('More', overlayText))
    expect(await screen.findByText('Nested', overlayText)).toBeInTheDocument()
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(ContextMenuHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
