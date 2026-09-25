import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'

// Base UI's popup animation toggles pointer-events while entering; disable
// user-event's safety check the same way the Select test does.
const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })

function BasicMenu({ size, onSelect }: { size?: 'sm' | 'md' | 'lg'; onSelect?: () => void } = {}) {
  return (
    <DropdownMenu {...(size && { size })}>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>Actions</DropdownMenuGroupLabel>
          <DropdownMenuItem onClick={onSelect}>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLinkItem href="https://example.com">Docs</DropdownMenuLinkItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

describe('DropdownMenu', () => {
  it('does not render content before being opened', () => {
    render(<BasicMenu />)
    expect(screen.queryByText('Profile')).toBeNull()
  })

  it('opens on trigger click and shows items', async () => {
    const user = setupUser()
    render(<BasicMenu />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(await screen.findByRole('menuitem', { name: 'Profile' })).toBeInTheDocument()
  })

  it('fires onClick and closes on item click', async () => {
    const user = setupUser()
    const onSelect = vi.fn()
    render(<BasicMenu onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Profile' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Profile' })).toBeNull()
    })
  })

  it('closes on Escape', async () => {
    const user = setupUser()
    render(<BasicMenu />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('menuitem', { name: 'Profile' })
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Profile' })).toBeNull()
    })
  })

  it('propagates size to items via navigationLinkVariants', async () => {
    const user = setupUser()
    render(<BasicMenu size="lg" />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const item = await screen.findByRole('menuitem', { name: 'Profile' })
    expect(item.className).toContain('text-base')
  })

  it('marks every item kind with data-orientation="vertical"', async () => {
    const user = setupUser()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
          <DropdownMenuLinkItem href="https://example.com">Link</DropdownMenuLinkItem>
          <DropdownMenuCheckboxItem>Check</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Radio</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Nested</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('menuitem', { name: 'Item' })
    const items = document.querySelectorAll('[data-slot$="-item"], [data-slot="dropdown-menu-sub-trigger"]')
    expect(items).toHaveLength(5)
    items.forEach((item) => expect(item).toHaveAttribute('data-orientation', 'vertical'))
  })

  it('renders the popup with size-driven radius', async () => {
    const user = setupUser()
    render(<BasicMenu size="sm" />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const item = await screen.findByRole('menuitem', { name: 'Profile' })
    const popup = item.closest('[data-slot="dropdown-menu-content"]') as HTMLElement
    expect(popup).not.toBeNull()
    expect(popup.className).toContain('rounded-md')
    expect(popup.className).toContain('bg-background')
  })

  it('renders a disabled item with data-disabled', async () => {
    const user = setupUser()
    render(<BasicMenu />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const disabled = await screen.findByRole('menuitem', { name: 'Disabled' })
    expect(disabled.getAttribute('data-disabled')).not.toBeNull()
  })

  it('renders a LinkItem as an anchor with href', async () => {
    const user = setupUser()
    render(<BasicMenu />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const link = (await screen.findByText('Docs')).closest('a') as HTMLAnchorElement
    expect(link).not.toBeNull()
    expect(link.getAttribute('href')).toBe('https://example.com')
  })

  it('navigates items with the keyboard', async () => {
    const user = setupUser()
    render(<BasicMenu />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('menuitem', { name: 'Profile' })
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
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup
              value={value}
              onValueChange={(next) => {
                onValueChange(next)
                setValue(next as string)
              }}
            >
              <DropdownMenuRadioItem value="a">A</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="b">B</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    render(<Wrapped />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const itemB = await screen.findByRole('menuitemradio', { name: 'B' })
    await user.click(itemB)
    expect(onValueChange).toHaveBeenCalledWith('b')

    // Radio items keep the menu open (Base UI `closeOnClick` defaults to false);
    // the checked indicator moves to B in place.
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
        <DropdownMenu>
          <DropdownMenuTrigger>Open</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={checked}
              onCheckedChange={(next) => {
                onCheckedChange(next)
                setChecked(next)
              }}
            >
              Notifications
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    render(<Wrapped />)
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const item = await screen.findByRole('menuitemcheckbox', { name: 'Notifications' })
    await user.click(item)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('Submenu: SubTrigger renders chevron and opens on hover', async () => {
    const user = setupUser()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Top</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Nested</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
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
