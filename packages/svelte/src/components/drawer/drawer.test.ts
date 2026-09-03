import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { createHandle } from '../../internal/overlay-handle.svelte'
import DrawerHost from './drawer.test-host.svelte'
import { Drawer } from './index'

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })

describe('Drawer', () => {
  it('tags the trigger with data-slot', () => {
    render(DrawerHost)
    expect(screen.getByRole('button', { name: 'Open drawer' }).getAttribute('data-slot')).toBe('drawer-trigger')
  })

  it('does not render content before being opened', () => {
    render(DrawerHost)
    expect(screen.queryByText('Body content')).toBeNull()
  })

  it('opens from the default side and exposes a labeled dialog', async () => {
    const user = setupUser()
    render(DrawerHost)

    await user.click(screen.getByRole('button', { name: 'Open drawer' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAccessibleName('Edit profile')
    expect(dialog.getAttribute('data-slot')).toBe('drawer-popup')
    expect(dialog).toHaveAttribute('data-side', 'bottom')

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it.each(['top', 'left', 'right'] as const)('opens from side=%s', async (side) => {
    const user = setupUser()
    render(DrawerHost, { props: { side } })
    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveAttribute('data-side', side)

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('closes from the built-in close button', async () => {
    const user = setupUser()
    render(DrawerHost)
    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('closes on Escape', async () => {
    const user = setupUser()
    render(DrawerHost)
    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('turns the backdrop off for nested drawers by default', async () => {
    const user = setupUser()
    render(DrawerHost, { props: { nested: true } })
    await user.click(screen.getByRole('button', { name: 'Open drawer' }))
    await screen.findByText('Body content')
    expect(document.querySelectorAll('[data-slot="drawer-backdrop"]')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Nested' }))
    await screen.findByText('Nested body')
    expect(document.querySelectorAll('[data-slot="drawer-backdrop"]')).toHaveLength(1)
  })

  it('exposes createHandle', async () => {
    expect(typeof Drawer.createHandle).toBe('function')
    const handle = createHandle()
    render(DrawerHost, { props: { handle } })
    handle.open = true
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(DrawerHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
