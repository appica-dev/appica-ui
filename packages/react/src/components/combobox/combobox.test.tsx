import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  createComboboxItems,
} from './combobox'

const FRAMEWORKS = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro']

type SingleArgs = {
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outline' | 'soft'
  clearable?: boolean
  icon?: boolean
  placeholder?: string
}

function renderSingle({
  defaultValue,
  onValueChange,
  size,
  variant,
  clearable,
  icon,
  placeholder = 'Select a framework',
}: SingleArgs = {}) {
  return render(
    <Combobox
      items={FRAMEWORKS}
      {...(size !== undefined && { size })}
      {...(variant !== undefined && { variant })}
      {...(clearable !== undefined && { clearable })}
      {...(icon !== undefined && { icon })}
      {...(defaultValue != null && { defaultValue })}
      {...(onValueChange !== undefined && { onValueChange: onValueChange as never })}
    >
      <ComboboxInput placeholder={placeholder} aria-label={placeholder} />
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  )
}

function MultiHarness({
  variant,
  onValueChange,
}: {
  variant?: 'outline' | 'soft'
  onValueChange?: (value: string[]) => void
}) {
  const [value, setValue] = React.useState<string[]>([])
  return (
    <Combobox
      items={FRAMEWORKS}
      multiple
      {...(variant !== undefined && { variant })}
      value={value}
      onValueChange={(next) => {
        const arr = next as string[]
        setValue(arr)
        onValueChange?.(arr)
      }}
    >
      <ComboboxChips placeholder="Add framework">
        <ComboboxValue>
          {(items: string[]) =>
            items.map((item) => (
              <ComboboxChip key={item} aria-label={`chip-${item}`}>
                {item}
              </ComboboxChip>
            ))
          }
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })

describe('Combobox', () => {
  it('tags input and content with data-slot', async () => {
    const user = setupUser()
    renderSingle()
    const input = screen.getByRole('combobox')
    const group = input.closest('[data-slot="combobox-input"]')
    expect(group).not.toBeNull()

    await user.click(input)
    const popup = await screen.findByRole('listbox')
    const content = popup.closest('[data-slot="combobox-content"]')
    expect(content).not.toBeNull()
  })

  it('does not render the popup before opening', () => {
    renderSingle()
    expect(screen.queryByRole('option', { name: 'Next.js' })).toBeNull()
  })

  it('opens on click and renders all items', async () => {
    const user = setupUser()
    renderSingle({ size: 'sm' })
    await user.click(screen.getByRole('combobox'))
    for (const name of FRAMEWORKS) {
      expect(await screen.findByRole('option', { name })).toBeInTheDocument()
    }
  })

  it('filters items as the user types', async () => {
    const user = setupUser()
    renderSingle()
    const input = screen.getByRole('combobox')
    await user.click(input)
    await screen.findByRole('option', { name: 'Next.js' })

    await user.type(input, 'sve')
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: 'Next.js' })).toBeNull()
    })
    expect(screen.getByRole('option', { name: 'SvelteKit' })).toBeInTheDocument()
  })

  it('selects an item and fires onValueChange', async () => {
    const user = setupUser()
    const onValueChange = vi.fn()
    renderSingle({ onValueChange })

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Remix' }))

    expect(onValueChange).toHaveBeenCalledWith('Remix', expect.anything())
  })

  it('selects by ID from a createComboboxItems collection and shows the label', async () => {
    const user = setupUser()
    const onValueChange = vi.fn()
    const people = [
      { id: 'liam', name: 'Liam Hudson' },
      { id: 'sarah', name: 'Sarah Jenkins' },
    ]
    const items = createComboboxItems(people, { getValue: (person) => person.id, getLabel: (person) => person.name })
    render(
      <Combobox items={items} onValueChange={onValueChange}>
        <ComboboxInput aria-label="Assign to" />
        <ComboboxContent>
          <ComboboxList>
            {(person: (typeof people)[number]) => (
              <ComboboxItem key={person.id} value={person.id}>
                {person.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    )

    const input = screen.getByRole('combobox', { name: 'Assign to' })
    await user.type(input, 'sar')
    expect(screen.queryByRole('option', { name: 'Liam Hudson' })).toBeNull()
    await user.click(await screen.findByRole('option', { name: 'Sarah Jenkins' }))

    expect(onValueChange).toHaveBeenCalledWith('sarah', expect.anything())
    await waitFor(() => expect(input).toHaveValue('Sarah Jenkins'))
  })

  it('renders the check indicator on the selected item', async () => {
    const user = setupUser()
    renderSingle({ defaultValue: 'Astro' })
    await user.click(screen.getByRole('combobox'))

    const items = await screen.findAllByRole('option')
    const selected = items.find((item) => item.getAttribute('data-selected') !== null)
    expect(selected).toBeDefined()
    expect(selected!.querySelector('[data-slot="combobox-item-indicator"] svg')).not.toBeNull()
  })

  it('rotates the chevron when the popup opens via a named-group selector', async () => {
    const user = setupUser()
    renderSingle()
    const input = screen.getByRole('combobox')
    const trigger = input.parentElement!.querySelector('[data-slot="combobox-toggle"]') as HTMLElement
    expect(trigger).not.toBeNull()
    expect(trigger.className).toContain('group/combobox-toggle')

    const icon = trigger.querySelector('svg')
    expect(icon).not.toBeNull()
    expect(icon!.getAttribute('class') ?? '').toContain('group-data-popup-open/combobox-toggle:rotate-180')

    await user.click(input)
    await screen.findByRole('option', { name: 'Next.js' })
    expect(trigger.getAttribute('data-popup-open')).toBe('')
  })

  it('renders the clear control when clearable is set and value is present, and clears on click', async () => {
    const user = setupUser()
    const onValueChange = vi.fn()
    renderSingle({ defaultValue: 'Astro', clearable: true, onValueChange })

    const clearBtn = await screen.findByRole('button', { name: 'Clear selection' })
    await user.click(clearBtn)

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalled()
    })
    const lastCall = onValueChange.mock.calls[onValueChange.mock.calls.length - 1]
    expect(lastCall![0]).toBeNull()
  })

  it('does not render the clear control when there is no value', () => {
    renderSingle({ clearable: true })
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull()
  })

  it('renders the chevron trigger by default', () => {
    renderSingle()
    expect(screen.getByRole('button', { name: 'Toggle popup' })).toBeInTheDocument()
  })

  it('hides the chevron trigger when icon is false', () => {
    renderSingle({ icon: false })
    expect(screen.queryByRole('button', { name: 'Toggle popup' })).toBeNull()
  })

  it('shows ComboboxEmpty when the filter has no matches', async () => {
    const user = setupUser()
    renderSingle()
    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'zzzzzz')
    expect(await screen.findByText('No items found.')).toBeInTheDocument()
  })

  it('closes the popup on Escape', async () => {
    const user = setupUser()
    renderSingle()
    await user.click(screen.getByRole('combobox'))
    await screen.findByRole('option', { name: 'Next.js' })

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: 'Next.js' })).toBeNull()
    })
  })

  it('supports static children in ComboboxList', async () => {
    const user = setupUser()
    render(
      <Combobox>
        <ComboboxInput aria-label="Pick" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="one">One</ComboboxItem>
            <ComboboxItem value="two">Two</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    )
    await user.click(screen.getByRole('combobox'))
    expect(await screen.findByRole('option', { name: 'One' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Two' })).toBeInTheDocument()
  })

  it('mirrors a standalone aria-invalid to data-invalid on the input group', () => {
    render(
      <Combobox items={FRAMEWORKS}>
        <ComboboxInput aria-invalid aria-label="Search" />
        <ComboboxContent>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    )
    const input = screen.getByRole('combobox')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const group = input.closest('[data-slot="combobox-input"]')
    expect(group?.getAttribute('data-invalid')).toBe('')
  })

  it('does not set data-invalid when aria-invalid is absent', () => {
    renderSingle()
    const group = screen.getByRole('combobox').closest('[data-slot="combobox-input"]')
    expect(group?.getAttribute('data-invalid')).toBeNull()
  })

  it('has no accessibility violations in the closed state', async () => {
    const { container } = renderSingle()
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('multiple', () => {
    it('renders a chip per selected item and fires onValueChange with the remaining array when removed', async () => {
      const user = setupUser()
      const onValueChange = vi.fn()
      render(<MultiHarness onValueChange={onValueChange} />)

      const input = screen.getByRole('combobox')
      await user.click(input)
      await user.click(await screen.findByRole('option', { name: 'Next.js' }))
      await user.click(await screen.findByRole('option', { name: 'Remix' }))

      await waitFor(() => {
        expect(screen.getByLabelText('chip-Next.js')).toBeInTheDocument()
        expect(screen.getByLabelText('chip-Remix')).toBeInTheDocument()
      })

      const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
      await user.click(removeButtons[0]!)

      await waitFor(() => {
        const lastCall = onValueChange.mock.calls[onValueChange.mock.calls.length - 1]
        expect(lastCall![0]).toHaveLength(1)
      })
    })

    it('applies button "soft" classes to chips when Combobox variant is outline', async () => {
      const user = setupUser()
      render(<MultiHarness variant="outline" />)
      await user.click(screen.getByRole('combobox'))
      await user.click(await screen.findByRole('option', { name: 'Astro' }))

      const chip = await screen.findByLabelText('chip-Astro')
      expect(chip.className).toContain('before:bg-background-muted')
    })

    it('applies button "outline" classes to chips when Combobox variant is soft', async () => {
      const user = setupUser()
      render(<MultiHarness variant="soft" />)
      await user.click(screen.getByRole('combobox'))
      await user.click(await screen.findByRole('option', { name: 'Astro' }))

      const chip = await screen.findByLabelText('chip-Astro')
      expect(chip.className).toContain('before:bg-background')
      expect(chip.className).toContain('before:border-border')
    })
  })

  describe('grid layout', () => {
    function renderGrid({ cols }: { cols?: number } = {}) {
      return render(
        <Combobox items={FRAMEWORKS} grid>
          <ComboboxInput aria-label="Grid search" />
          <ComboboxContent>
            <ComboboxList {...(cols !== undefined && { cols })}>
              {(item: string) => (
                <ComboboxItem key={item} value={item} className="flex-1">
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>,
      )
    }

    it('forwards grid to Base UI Root - popup uses the grid role', async () => {
      const user = setupUser()
      renderGrid()
      await user.click(screen.getByRole('combobox'))
      expect(await screen.findByRole('grid')).toBeInTheDocument()
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('chunks filtered items into rows of 2 by default when grid is set', async () => {
      const user = setupUser()
      renderGrid()
      await user.click(screen.getByRole('combobox'))
      await screen.findByRole('grid')

      const rows = document.querySelectorAll('[data-slot="combobox-row"]')
      // FRAMEWORKS has 5 items → ceil(5 / 2) = 3 rows
      expect(rows).toHaveLength(3)
      expect(rows[0]!.children).toHaveLength(2)
      expect(rows[2]!.children).toHaveLength(1)
    })

    it('respects an explicit cols override on ComboboxList', async () => {
      const user = setupUser()
      renderGrid({ cols: 4 })
      await user.click(screen.getByRole('combobox'))
      await screen.findByRole('grid')

      const rows = document.querySelectorAll('[data-slot="combobox-row"]')
      // 5 items, cols=4 → 2 rows (4 + 1)
      expect(rows).toHaveLength(2)
      expect(rows[0]!.children).toHaveLength(4)
      expect(rows[1]!.children).toHaveLength(1)
    })

    it('does not auto-chunk when children is static JSX (no render fn)', async () => {
      const user = setupUser()
      render(
        <Combobox items={FRAMEWORKS} grid>
          <ComboboxInput aria-label="Static grid" />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxItem value="one">One</ComboboxItem>
              <ComboboxItem value="two">Two</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>,
      )
      await user.click(screen.getByRole('combobox'))
      await screen.findByRole('grid')
      expect(document.querySelectorAll('[data-slot="combobox-row"]')).toHaveLength(0)
    })
  })
})
