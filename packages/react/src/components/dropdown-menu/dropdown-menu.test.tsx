import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuEmpty,
  DropdownMenuFilterProvider,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuInput,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuList,
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

  it('reports highlight changes through onItemHighlighted', async () => {
    const user = setupUser()
    const onItemHighlighted = vi.fn()
    render(
      <DropdownMenu onItemHighlighted={onItemHighlighted}>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    await screen.findByRole('menuitem', { name: 'Profile' })
    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      expect(onItemHighlighted).toHaveBeenCalledWith(
        screen.getByRole('menuitem', { name: 'Profile' }),
        expect.objectContaining({ reason: 'keyboard', event: expect.any(KeyboardEvent) }),
      )
    })
  })

  it('List: keeps content beside the list out of the menu role', async () => {
    const user = setupUser()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <p>Signed in as Sarah</p>
          <DropdownMenuList>
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </DropdownMenuList>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const menu = await screen.findByRole('menu')
    expect(menu).toContainElement(screen.getByRole('menuitem', { name: 'Profile' }))
    expect(menu).not.toContainElement(screen.getByText('Signed in as Sarah'))
  })
})

function FilterMenu({ onDuplicate, autoHighlight }: { onDuplicate?: () => void; autoHighlight?: boolean } = {}) {
  return (
    <DropdownMenuFilterProvider {...(autoHighlight && { autoHighlight })}>
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuInput aria-label="Filter actions" placeholder="Filter actions" />
          <DropdownMenuEmpty>No actions found.</DropdownMenuEmpty>
          <DropdownMenuList>
            <DropdownMenuGroup>
              <DropdownMenuGroupLabel>File</DropdownMenuGroupLabel>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup data-testid="share-group">
              <DropdownMenuGroupLabel>Share</DropdownMenuGroupLabel>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuList>
        </DropdownMenuContent>
      </DropdownMenu>
    </DropdownMenuFilterProvider>
  )
}

describe('DropdownMenu filtering', () => {
  it('focuses the search field when opened with a click', async () => {
    const user = setupUser()
    render(<FilterMenu />)
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const input = await screen.findByRole('searchbox', { name: 'Filter actions' })
    await waitFor(() => expect(input).toHaveFocus())
  })

  it('narrows the items to the matches and hides groups left empty', async () => {
    const user = setupUser()
    render(<FilterMenu />)
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    await user.type(await screen.findByRole('searchbox', { name: 'Filter actions' }), 'ren')
    await waitFor(() => {
      expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Rename'])
    })
    expect(screen.getByTestId('share-group')).not.toBeVisible()
  })

  it('announces the empty message once nothing matches', async () => {
    const user = setupUser()
    render(<FilterMenu />)
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    expect(screen.queryByText('No actions found.')).toBeNull()
    await user.type(await screen.findByRole('searchbox', { name: 'Filter actions' }), 'zzz')
    expect(await screen.findByRole('status')).toHaveTextContent('No actions found.')
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0)
  })

  it('selects a match with the keyboard while focus stays in the field', async () => {
    const user = setupUser()
    const onDuplicate = vi.fn()
    render(<FilterMenu onDuplicate={onDuplicate} />)
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const input = await screen.findByRole('searchbox', { name: 'Filter actions' })
    await user.type(input, 'dup')
    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveAttribute('data-highlighted')
    })
    expect(input).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onDuplicate).toHaveBeenCalledTimes(1)
  })

  it('highlights the first match as you type with autoHighlight', async () => {
    const user = setupUser()
    render(<FilterMenu autoHighlight />)
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    await user.type(await screen.findByRole('searchbox', { name: 'Filter actions' }), 'link')
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: 'Copy link' })).toHaveAttribute('data-highlighted')
    })
  })

  it('clears the query from the clear button', async () => {
    const user = setupUser()
    render(<FilterMenu />)
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    const input = await screen.findByRole('searchbox', { name: 'Filter actions' })
    expect(document.querySelector('[data-slot="dropdown-menu-clear"]')).toBeNull()
    await user.type(input, 'ren')
    const clear = document.querySelector<HTMLButtonElement>('[data-slot="dropdown-menu-clear"]')
    expect(clear).not.toBeNull()
    await user.click(clear!)
    expect(input).toHaveValue('')
    await waitFor(() => expect(screen.getAllByRole('menuitem')).toHaveLength(3))
  })

  it('filters a submenu wrapped in its own provider', async () => {
    const user = setupUser()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuFilterProvider>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuInput aria-label="Filter folders" />
                <DropdownMenuList>
                  <DropdownMenuItem>Documents</DropdownMenuItem>
                  <DropdownMenuItem>Downloads</DropdownMenuItem>
                  <DropdownMenuItem>Projects</DropdownMenuItem>
                </DropdownMenuList>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuFilterProvider>
        </DropdownMenuContent>
      </DropdownMenu>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    expect(screen.queryByRole('searchbox')).toBeNull()
    await screen.findByRole('menuitem', { name: /Move to/ })
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}')
    const input = await screen.findByRole('searchbox', { name: 'Filter folders' })
    await waitFor(() => expect(input).toHaveFocus())
    await user.keyboard('do')
    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Projects' })).toBeNull()
    })
    expect(screen.getByRole('menuitem', { name: 'Documents' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Downloads' })).toBeInTheDocument()
  })

  it('has no a11y violations while open', async () => {
    const user = setupUser()
    render(<FilterMenu />)
    await user.click(screen.getByRole('button', { name: 'Actions' }))
    await user.type(await screen.findByRole('searchbox', { name: 'Filter actions' }), 're')
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
