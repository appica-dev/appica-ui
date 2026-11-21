import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Button } from '../button/button'
import {
  CommandPalette,
  CommandPaletteCollection,
  CommandPaletteContent,
  CommandPaletteEmpty,
  CommandPaletteFooter,
  CommandPaletteGroup,
  CommandPaletteInput,
  CommandPaletteItem,
  CommandPaletteLabel,
  CommandPaletteList,
  CommandPaletteTrigger,
  type CommandPaletteContentProps,
  type CommandPaletteProps,
} from './command-palette'

interface Command {
  value: string
  label: string
}

const COMMANDS: Command[] = [
  { value: 'new-file', label: 'New file' },
  { value: 'open-folder', label: 'Open folder' },
  { value: 'settings', label: 'Settings' },
]

const GROUPS = [
  { value: 'Files', items: COMMANDS.slice(0, 2) },
  { value: 'App', items: COMMANDS.slice(2) },
]

function Palette({
  onRun = () => {},
  content,
  closeOnSelect,
  ...props
}: Partial<CommandPaletteProps> & {
  onRun?: (value: string) => void
  content?: Partial<CommandPaletteContentProps>
  closeOnSelect?: boolean
}) {
  return (
    <CommandPalette items={COMMANDS} {...props}>
      <CommandPaletteTrigger render={<Button>Open palette</Button>} />
      <CommandPaletteContent {...content}>
        <CommandPaletteInput placeholder="Type a command" />
        <CommandPaletteList>
          {(command: Command) => (
            <CommandPaletteItem
              key={command.value}
              value={command}
              closeOnSelect={closeOnSelect}
              onClick={() => onRun(command.value)}
            >
              {command.label}
            </CommandPaletteItem>
          )}
        </CommandPaletteList>
        <CommandPaletteEmpty>No commands found.</CommandPaletteEmpty>
        <CommandPaletteFooter>Footer</CommandPaletteFooter>
      </CommandPaletteContent>
    </CommandPalette>
  )
}

async function openPalette(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Open palette' }))
  return screen.findByRole('dialog', { name: 'Command palette' })
}

describe('CommandPalette', () => {
  it('opens from the trigger as a named dialog with the input focused', async () => {
    const user = userEvent.setup()
    render(<Palette />)
    const dialog = await openPalette(user)
    expect(dialog).toHaveAttribute('data-slot', 'command-palette-content')
    const input = screen.getByRole('combobox', { name: 'Command palette' })
    await waitFor(() => expect(input).toHaveFocus())
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.getByText('Footer')).toHaveAttribute('data-slot', 'command-palette-footer')
  })

  it('names the dialog and the input from label', async () => {
    const user = userEvent.setup()
    render(<Palette content={{ label: 'Search the docs' }} />)
    await user.click(screen.getByRole('button', { name: 'Open palette' }))
    expect(await screen.findByRole('dialog', { name: 'Search the docs' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Search the docs' })).toBeInTheDocument()
  })

  it('filters the items as the user types and shows the empty state', async () => {
    const user = userEvent.setup()
    render(<Palette />)
    await openPalette(user)
    await user.type(screen.getByRole('combobox'), 'fold')
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Open folder'])
    await user.type(screen.getByRole('combobox'), 'zzz')
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText('No commands found.')).toBeInTheDocument()
  })

  it('highlights the first match and runs it on Enter, then closes', async () => {
    const user = userEvent.setup()
    const onRun = vi.fn()
    render(<Palette onRun={onRun} />)
    await openPalette(user)
    const input = screen.getByRole('combobox')
    await user.type(input, 'set')
    expect(screen.getByRole('option', { name: 'Settings' })).toHaveAttribute('data-highlighted')
    await user.keyboard('{Enter}')
    expect(onRun).toHaveBeenCalledWith('settings')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('moves the highlight with the arrow keys', async () => {
    const user = userEvent.setup()
    const onRun = vi.fn()
    render(<Palette onRun={onRun} />)
    await openPalette(user)
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus())
    expect(screen.getByRole('option', { name: 'New file' })).toHaveAttribute('data-highlighted')
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: 'Open folder' })).toHaveAttribute('data-highlighted')
    await user.keyboard('{Enter}')
    expect(onRun).toHaveBeenCalledWith('open-folder')
  })

  it('stays open and keeps the query when an item has closeOnSelect={false}', async () => {
    const user = userEvent.setup()
    const onRun = vi.fn()
    render(<Palette onRun={onRun} closeOnSelect={false} />)
    await openPalette(user)
    const input = screen.getByRole('combobox')
    await user.type(input, 'new')
    await user.click(screen.getByRole('option', { name: 'New file' }))
    expect(onRun).toHaveBeenCalledWith('new-file')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(input).toHaveValue('new')
  })

  it('reports the query through onValueChange but not an item press', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Palette onValueChange={onValueChange} closeOnSelect={false} />)
    await openPalette(user)
    await user.type(screen.getByRole('combobox'), 'o')
    expect(onValueChange).toHaveBeenLastCalledWith('o', expect.objectContaining({ reason: 'input-change' }))
    onValueChange.mockClear()
    await user.click(screen.getByRole('option', { name: 'Open folder' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    render(<Palette />)
    await openPalette(user)
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('starts with an empty query each time it opens', async () => {
    const user = userEvent.setup()
    render(<Palette />)
    await openPalette(user)
    await user.type(screen.getByRole('combobox'), 'set')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await openPalette(user)
    expect(screen.getByRole('combobox')).toHaveValue('')
  })

  it('toggles with the shortcut key and ⌘ or Ctrl', async () => {
    const user = userEvent.setup()
    render(<Palette shortcut="k" />)
    await user.keyboard('{Meta>}k{/Meta}')
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Control>}k{/Control}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await user.keyboard('k')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens through the shortcut while controlled', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <output data-testid="state">{String(open)}</output>
          <Palette shortcut="k" open={open} onOpenChange={setOpen} />
        </>
      )
    }
    render(<Controlled />)
    await user.keyboard('{Meta>}k{/Meta}')
    expect(screen.getByTestId('state')).toHaveTextContent('true')
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('renders grouped items under their labels', async () => {
    const user = userEvent.setup()
    render(
      <CommandPalette items={GROUPS}>
        <CommandPaletteTrigger render={<Button>Open palette</Button>} />
        <CommandPaletteContent>
          <CommandPaletteInput />
          <CommandPaletteList>
            {(group: (typeof GROUPS)[number]) => (
              <CommandPaletteGroup key={group.value} items={group.items}>
                <CommandPaletteLabel>{group.value}</CommandPaletteLabel>
                <CommandPaletteCollection>
                  {(command: Command) => (
                    <CommandPaletteItem key={command.value} value={command}>
                      {command.label}
                    </CommandPaletteItem>
                  )}
                </CommandPaletteCollection>
              </CommandPaletteGroup>
            )}
          </CommandPaletteList>
        </CommandPaletteContent>
      </CommandPalette>,
    )
    await openPalette(user)
    expect(screen.getByRole('group', { name: 'Files' })).toBeInTheDocument()
    await user.type(screen.getByRole('combobox'), 'sett')
    expect(screen.queryByRole('group', { name: 'Files' })).toBeNull()
    expect(screen.getByRole('group', { name: 'App' })).toBeInTheDocument()
  })

  it('renders the frame and backdrop by default and drops them on request', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Palette />)
    const framed = await openPalette(user)
    expect(framed).toHaveAttribute('data-frame')
    expect(document.querySelector('[data-slot="command-palette-backdrop"]')).not.toBeNull()
    unmount()

    render(<Palette content={{ frame: false }} />)
    expect(await openPalette(user)).not.toHaveAttribute('data-frame')
  })

  it('omits the backdrop with backdrop={false}, which also drops the frame', async () => {
    const user = userEvent.setup()
    render(<Palette content={{ backdrop: false }} />)
    const dialog = await openPalette(user)
    expect(dialog).not.toHaveAttribute('data-frame')
    expect(document.querySelector('[data-slot="command-palette-backdrop"]')).toBeNull()
  })

  it('swaps the input appearance and its start adornment', async () => {
    const user = userEvent.setup()
    render(
      <CommandPalette items={COMMANDS}>
        <CommandPaletteTrigger render={<Button>Open palette</Button>} />
        <CommandPaletteContent>
          <CommandPaletteInput variant="outline" startSlot={null} endSlot={<span>⌘K</span>} />
          <CommandPaletteList>{() => null}</CommandPaletteList>
        </CommandPaletteContent>
      </CommandPalette>,
    )
    await openPalette(user)
    expect(document.querySelector('[data-slot="command-palette-input-start"]')).toBeNull()
    expect(document.querySelector('[data-slot="command-palette-input-end"]')).toHaveTextContent('⌘K')
  })

  it('has no accessibility violations while open', async () => {
    const user = userEvent.setup()
    render(<Palette />)
    await openPalette(user)
    expect(await axe(document.body)).toHaveNoViolations()
  })
})
