import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import MenubarHost from './menubar.test-host.svelte'

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })
const overlayText = { hidden: true as const }

describe('Menubar', () => {
  it('renders a horizontal menubar with the expected slot and orientation', () => {
    render(MenubarHost)
    const bar = screen.getByRole('menubar', { name: 'Main' })
    expect(bar.getAttribute('data-slot')).toBe('menubar')
    expect(bar.getAttribute('data-orientation')).toBe('horizontal')
  })

  it('applies flex-col styling when orientation is vertical', () => {
    render(MenubarHost, { props: { orientation: 'vertical' } })
    const bar = screen.getByRole('menubar', { name: 'Main' })
    expect(bar.getAttribute('data-orientation')).toBe('vertical')
    expect(bar.className).toContain('flex-col')
  })

  it('opens a menu on trigger click and shows items', async () => {
    const user = setupUser()
    render(MenubarHost)
    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    const item = await screen.findByText('New', overlayText)
    expect(item.closest('[data-slot="menubar-item"]')).toHaveAttribute('role', 'menuitem')
  })

  it('closes on item click', async () => {
    const user = setupUser()
    render(MenubarHost)
    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    await user.click(await screen.findByText('New', overlayText))
    await waitFor(() => {
      expect(screen.queryByText('New', overlayText)).toBeNull()
    })
  })

  it('opens a submenu', async () => {
    const user = setupUser()
    render(MenubarHost)
    await user.click(screen.getByRole('menuitem', { name: 'File' }))
    await user.hover(await screen.findByText('More', overlayText))
    expect(await screen.findByText('Nested', overlayText)).toBeInTheDocument()
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(MenubarHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
