import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuLinkItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from './context-menu'

// Base UI's popup animation toggles pointer-events while entering; disable
// user-event's safety check the same way the Select/DropdownMenu tests do.
const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })

function BasicMenu({ size, onSelect }: { size?: 'sm' | 'md' | 'lg'; onSelect?: () => void } = {}) {
  return (
    <ContextMenu {...(size && { size })}>
      <ContextMenuTrigger data-testid="trigger">Right click here</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuGroupLabel>Actions</ContextMenuGroupLabel>
          <ContextMenuItem onClick={onSelect}>Profile</ContextMenuItem>
          <ContextMenuItem>Settings</ContextMenuItem>
          <ContextMenuItem disabled>Disabled</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuLinkItem href="https://example.com">Docs</ContextMenuLinkItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

describe('ContextMenu', () => {
  it('does not render content before being opened', () => {
    render(<BasicMenu />)
    expect(screen.queryByText('Profile')).toBeNull()
  })

  it('opens on right click and shows items', async () => {
    const user = setupUser()
    render(<BasicMenu />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    expect(await screen.findByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
  })

  it('fires onClick and closes on item click', async () => {
    const user = setupUser()
    const onSelect = vi.fn()
    render(<BasicMenu onSelect={onSelect} />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    await user.click(await screen.findByRole('menuitem', { name: 'Profile' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Profile' })).toBeNull()
    })
  })

  it('closes on Escape', async () => {
    const user = setupUser()
    render(<BasicMenu />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    await screen.findByRole('menuitem', { name: 'Profile' })
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Profile' })).toBeNull()
    })
  })

  it('propagates size to items via navigationLinkVariants', async () => {
    const user = setupUser()
    render(<BasicMenu size="lg" />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    const item = await screen.findByRole('menuitem', { name: 'Profile' })
    expect(item.className).toContain('text-base')
  })

  it('marks every item kind with data-orientation="vertical"', async () => {
    const user = setupUser()
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right click here</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Item</ContextMenuItem>
          <ContextMenuLinkItem href="https://example.com">Link</ContextMenuLinkItem>
          <ContextMenuCheckboxItem>Check</ContextMenuCheckboxItem>
          <ContextMenuRadioGroup value="a">
            <ContextMenuRadioItem value="a">Radio</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuSub>
            <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Nested</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
    )
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    await screen.findByRole('menuitem', { name: 'Item' })
    const items = document.querySelectorAll('[data-slot$="-item"], [data-slot="context-menu-sub-trigger"]')
    expect(items).toHaveLength(5)
    items.forEach((item) => expect(item).toHaveAttribute('data-orientation', 'vertical'))
  })

  it('renders the popup with size-driven radius', async () => {
    const user = setupUser()
    render(<BasicMenu size="sm" />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    const item = await screen.findByRole('menuitem', { name: 'Profile' })
    const popup = item.closest('[data-slot="context-menu-content"]') as HTMLElement
    expect(popup).not.toBeNull()
    expect(popup.className).toContain('rounded-md')
    expect(popup.className).toContain('bg-background')
  })

  it('renders a disabled item with data-disabled', async () => {
    const user = setupUser()
    render(<BasicMenu />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    const disabled = await screen.findByRole('menuitem', { name: 'Disabled' })
    expect(disabled.getAttribute('data-disabled')).not.toBeNull()
  })

  it('renders a LinkItem as an anchor with href', async () => {
    const user = setupUser()
    render(<BasicMenu />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    const link = (await screen.findByText('Docs')).closest('a') as HTMLAnchorElement
    expect(link).not.toBeNull()
    expect(link.getAttribute('href')).toBe('https://example.com')
  })

  it('navigates items with the keyboard', async () => {
    const user = setupUser()
    render(<BasicMenu />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    const menu = await screen.findByRole('menu')
    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true))
    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      const profile = screen.getByRole('menuitem', { name: 'Profile' })
      expect(profile.getAttribute('data-highlighted')).not.toBeNull()
    })
  })

  it('RadioGroup: controlled value round-trips and only one indicator is checked', async () => {
    const user = setupUser()
    const onValueChange = vi.fn()

    function Wrapped() {
      const [value, setValue] = React.useState('a')
      return (
        <ContextMenu>
          <ContextMenuTrigger data-testid="trigger">Right click</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuRadioGroup
              value={value}
              onValueChange={(next) => {
                onValueChange(next)
                setValue(next as string)
              }}
            >
              <ContextMenuRadioItem value="a">A</ContextMenuRadioItem>
              <ContextMenuRadioItem value="b">B</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
      )
    }

    render(<Wrapped />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    const itemB = await screen.findByRole('menuitemradio', { name: 'B' })
    await user.click(itemB)
    expect(onValueChange).toHaveBeenCalledWith('b')

    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    const items = await screen.findAllByRole('menuitemradio')
    const checked = items.filter((el) => el.getAttribute('data-checked') !== null)
    expect(checked).toHaveLength(1)
    expect(checked[0]?.textContent).toBe('B')
  })

  it('CheckboxItem: controlled checked toggles via onCheckedChange', async () => {
    const user = setupUser()
    const onCheckedChange = vi.fn()

    function Wrapped() {
      const [checked, setChecked] = React.useState(false)
      return (
        <ContextMenu>
          <ContextMenuTrigger data-testid="trigger">Right click</ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuCheckboxItem
              checked={checked}
              onCheckedChange={(next) => {
                onCheckedChange(next)
                setChecked(next)
              }}
            >
              Notifications
            </ContextMenuCheckboxItem>
          </ContextMenuContent>
        </ContextMenu>
      )
    }

    render(<Wrapped />)
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    const item = await screen.findByRole('menuitemcheckbox', { name: 'Notifications' })
    await user.click(item)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('Submenu: SubTrigger renders chevron and opens on hover', async () => {
    const user = setupUser()
    render(
      <ContextMenu>
        <ContextMenuTrigger data-testid="trigger">Right click</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Top</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Nested</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuContent>
      </ContextMenu>,
    )
    await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('trigger') })
    const subTrigger = await screen.findByRole('menuitem', { name: /More/ })
    expect(subTrigger.querySelector('svg')).not.toBeNull()

    await user.hover(subTrigger)
    expect(await screen.findByRole('menuitem', { name: 'Nested' })).toBeInTheDocument()
  })

  it('has no a11y violations in closed state', async () => {
    const { container } = render(<BasicMenu />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
