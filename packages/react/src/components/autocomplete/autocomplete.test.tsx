import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteStatus,
  AutocompleteTrigger,
} from './autocomplete'

const FRAMEWORKS = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro']

type SingleArgs = {
  defaultValue?: string
  onValueChange?: (value: string) => void
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
  icon = true,
  placeholder = 'Search a framework',
}: SingleArgs = {}) {
  return render(
    <Autocomplete
      items={FRAMEWORKS}
      icon={icon}
      {...(size !== undefined && { size })}
      {...(variant !== undefined && { variant })}
      {...(clearable !== undefined && { clearable })}
      {...(defaultValue !== undefined && { defaultValue })}
      {...(onValueChange !== undefined && { onValueChange: onValueChange as never })}
    >
      <AutocompleteInput placeholder={placeholder} aria-label={placeholder} />
      <AutocompleteContent>
        <AutocompleteEmpty>No items found.</AutocompleteEmpty>
        <AutocompleteList>
          {(item: string) => (
            <AutocompleteItem key={item} value={item}>
              {item}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>,
  )
}

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })

describe('Autocomplete', () => {
  it('tags input and content with data-slot', async () => {
    const user = setupUser()
    renderSingle()
    const input = screen.getByRole('combobox')
    const group = input.closest('[data-slot="autocomplete-input"]')
    expect(group).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    const popup = await screen.findByRole('listbox')
    const content = popup.closest('[data-slot="autocomplete-content"]')
    expect(content).not.toBeNull()
  })

  it('does not render the popup before opening', () => {
    renderSingle()
    expect(screen.queryByRole('option', { name: 'Next.js' })).toBeNull()
  })

  it('opens via the trigger and renders all items', async () => {
    const user = setupUser()
    renderSingle({ size: 'sm' })
    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    for (const name of FRAMEWORKS) {
      expect(await screen.findByRole('option', { name })).toBeInTheDocument()
    }
  })

  it('filters items as the user types', async () => {
    const user = setupUser()
    renderSingle()
    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'sve')

    await waitFor(() => {
      expect(screen.queryByRole('option', { name: 'Next.js' })).toBeNull()
    })
    expect(screen.getByRole('option', { name: 'SvelteKit' })).toBeInTheDocument()
  })

  it('selects an item and fires onValueChange with a string', async () => {
    const user = setupUser()
    const onValueChange = vi.fn()
    renderSingle({ onValueChange })

    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    await user.click(await screen.findByRole('option', { name: 'Remix' }))

    expect(onValueChange).toHaveBeenCalledWith('Remix', expect.anything())
  })

  it('rotates the chevron when the popup opens via a named-group selector', async () => {
    const user = setupUser()
    renderSingle()
    const input = screen.getByRole('combobox')
    const iconBtn = input.parentElement!.querySelector('[data-slot="autocomplete-icon"]') as HTMLElement
    expect(iconBtn).not.toBeNull()
    expect(iconBtn.className).toContain('group/autocomplete-icon')

    const svg = iconBtn.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg!.getAttribute('class') ?? '').toContain('group-data-popup-open/autocomplete-icon:rotate-180')

    await user.click(iconBtn)
    await screen.findByRole('option', { name: 'Next.js' })
    expect(iconBtn.getAttribute('data-popup-open')).toBe('')
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
    expect(lastCall![0]).toBe('')
  })

  it('does not render the clear control when there is no value', () => {
    renderSingle({ clearable: true })
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull()
  })

  it('does not render the chevron icon by default', () => {
    render(
      <Autocomplete items={FRAMEWORKS}>
        <AutocompleteInput aria-label="Search a framework" />
        <AutocompleteContent>
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>,
    )
    expect(screen.queryByRole('button', { name: 'Toggle popup' })).toBeNull()
  })

  it('renders the chevron icon when icon is true', () => {
    renderSingle({ icon: true })
    expect(screen.getByRole('button', { name: 'Toggle popup' })).toBeInTheDocument()
  })

  it('renders a standalone AutocompleteTrigger that opens the popup', async () => {
    const user = setupUser()
    const { container } = render(
      <Autocomplete items={FRAMEWORKS}>
        <AutocompleteTrigger aria-label="Open picker">Open</AutocompleteTrigger>
        <AutocompleteContent>
          <AutocompleteInput aria-label="Search in popup" />
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>,
    )
    const trigger = container.querySelector('[data-slot="autocomplete-trigger"]') as HTMLElement
    expect(trigger).not.toBeNull()
    expect(trigger.tagName).toBe('BUTTON')

    await user.click(trigger)
    expect(await screen.findByRole('option', { name: 'Next.js' })).toBeInTheDocument()
  })

  it('disables the icon and clear buttons when the input is disabled', () => {
    render(
      <Autocomplete items={FRAMEWORKS} clearable icon defaultValue="Astro">
        <AutocompleteInput disabled aria-label="Disabled" />
        <AutocompleteContent>
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>,
    )
    const iconBtn = screen.getByRole('button', { name: 'Toggle popup' })
    const clear = screen.getByRole('button', { name: 'Clear selection' })
    expect(iconBtn).toBeDisabled()
    expect(clear).toBeDisabled()
  })

  it('keeps AutocompleteEmpty in the accessibility tree as a status region while results show', async () => {
    const user = setupUser()
    renderSingle()
    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    await screen.findByRole('option', { name: 'Next.js' })

    const empty = document.querySelector('[data-slot="autocomplete-empty"]')
    expect(empty).toBeEmptyDOMElement()
    expect(empty).not.toHaveClass('hidden')
    expect(screen.getByRole('status')).toBe(empty)
  })

  it('renders the no-results text inside the status region', async () => {
    const user = setupUser()
    renderSingle()
    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'zzzzzz')
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('No items found.')
    expect(status).toHaveAttribute('data-slot', 'autocomplete-empty')
  })

  it('has no accessibility violations with the popup open and no matches', async () => {
    const user = setupUser()
    renderSingle()
    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'zzzzzz')
    await screen.findByText('No items found.')
    expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations()
  })

  it('shows AutocompleteEmpty when the filter has no matches', async () => {
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
    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    await screen.findByRole('option', { name: 'Next.js' })

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('option', { name: 'Next.js' })).toBeNull()
    })
  })

  it('supports static children in AutocompleteList', async () => {
    const user = setupUser()
    render(
      <Autocomplete icon>
        <AutocompleteInput aria-label="Pick" />
        <AutocompleteContent>
          <AutocompleteList>
            <AutocompleteItem value="one">One</AutocompleteItem>
            <AutocompleteItem value="two">Two</AutocompleteItem>
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>,
    )
    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    expect(await screen.findByRole('option', { name: 'One' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Two' })).toBeInTheDocument()
  })

  it('keeps AutocompleteStatus mounted in the popup', async () => {
    const user = setupUser()
    render(
      <Autocomplete items={FRAMEWORKS} icon>
        <AutocompleteInput aria-label="Search" />
        <AutocompleteContent>
          <AutocompleteStatus>Loading…</AutocompleteStatus>
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>,
    )

    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    const status = await screen.findByText('Loading…')
    expect(status.closest('[data-slot="autocomplete-status"]')).not.toBeNull()
  })

  it('has no accessibility violations in the closed state', async () => {
    const { container } = renderSingle()
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('grid layout', () => {
    function renderGrid({ cols, icon = true }: { cols?: number; icon?: boolean } = {}) {
      return render(
        <Autocomplete items={FRAMEWORKS} grid icon={icon}>
          <AutocompleteInput aria-label="Grid search" />
          <AutocompleteContent>
            <AutocompleteList {...(cols !== undefined && { cols })}>
              {(item: string) => (
                <AutocompleteItem key={item} value={item} className="flex-1">
                  {item}
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>,
      )
    }

    it('forwards grid to Base UI Root - popup uses the grid role', async () => {
      const user = setupUser()
      renderGrid()
      await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
      expect(await screen.findByRole('grid')).toBeInTheDocument()
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('chunks filtered items into rows of 2 by default when grid is set', async () => {
      const user = setupUser()
      renderGrid()
      await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
      await screen.findByRole('grid')

      const rows = document.querySelectorAll('[data-slot="autocomplete-row"]')
      // FRAMEWORKS has 5 items → ceil(5 / 2) = 3 rows
      expect(rows).toHaveLength(3)
      expect(rows[0]!.children).toHaveLength(2)
      expect(rows[2]!.children).toHaveLength(1)
    })

    it('respects an explicit cols override on AutocompleteList', async () => {
      const user = setupUser()
      renderGrid({ cols: 4 })
      await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
      await screen.findByRole('grid')

      const rows = document.querySelectorAll('[data-slot="autocomplete-row"]')
      // 5 items, cols=4 → 2 rows (4 + 1)
      expect(rows).toHaveLength(2)
      expect(rows[0]!.children).toHaveLength(4)
      expect(rows[1]!.children).toHaveLength(1)
    })

    it('does not auto-chunk when children is static JSX (no render fn)', async () => {
      const user = setupUser()
      render(
        <Autocomplete items={FRAMEWORKS} grid icon>
          <AutocompleteInput aria-label="Static grid" />
          <AutocompleteContent>
            <AutocompleteList>
              <AutocompleteItem value="one">One</AutocompleteItem>
              <AutocompleteItem value="two">Two</AutocompleteItem>
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>,
      )
      await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
      await screen.findByRole('grid')
      expect(document.querySelectorAll('[data-slot="autocomplete-row"]')).toHaveLength(0)
    })
  })

  it('accepts a render prop on AutocompleteTrigger (composes with another element)', async () => {
    const user = setupUser()
    const { container } = render(
      <Autocomplete items={FRAMEWORKS}>
        <AutocompleteTrigger render={<button type="button" data-custom="yes" />}>Open</AutocompleteTrigger>
        <AutocompleteContent>
          <AutocompleteInput aria-label="Search" />
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem key={item} value={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>,
    )
    const trigger = container.querySelector('[data-slot="autocomplete-trigger"]') as HTMLElement
    expect(trigger).not.toBeNull()
    expect(trigger.getAttribute('data-custom')).toBe('yes')
    await user.click(trigger)
    expect(await screen.findByRole('option', { name: 'Next.js' })).toBeInTheDocument()
  })
})
