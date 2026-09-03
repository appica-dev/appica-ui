import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import AutocompleteHost from './autocomplete.test-host.svelte'

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })
const overlay = { hidden: true as const }

describe('Autocomplete', () => {
  it('tags the input group with data-slot', () => {
    render(AutocompleteHost)
    const input = screen.getByRole('combobox')
    expect(input.closest('[data-slot="autocomplete-input"]')).not.toBeNull()
  })

  it('does not render the popup before opening', () => {
    render(AutocompleteHost)
    expect(screen.queryByText('SvelteKit')).toBeNull()
  })

  it('opens on toggle and selects an item', async () => {
    const user = setupUser()
    render(AutocompleteHost, { props: { icon: true } })
    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    await user.click(await screen.findByText('SvelteKit', overlay))
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('SvelteKit')
    })
  })

  it('filters items as the user types', async () => {
    const user = setupUser()
    render(AutocompleteHost)
    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'sve')

    await waitFor(() => {
      expect(screen.queryByText('Next.js', overlay)).toBeNull()
    })
    expect(await screen.findByText('SvelteKit', overlay)).toBeInTheDocument()
  })

  it('shows AutocompleteEmpty when the filter has no matches', async () => {
    const user = setupUser()
    render(AutocompleteHost)
    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.type(input, 'zzzzzz')
    expect(await screen.findByText('No items found.')).toBeInTheDocument()
  })

  it('does not render the chevron icon by default', () => {
    render(AutocompleteHost)
    expect(screen.queryByRole('button', { name: 'Toggle popup' })).toBeNull()
  })

  it('renders the chevron icon when icon is true', () => {
    render(AutocompleteHost, { props: { icon: true } })
    expect(screen.getByRole('button', { name: 'Toggle popup' })).toBeInTheDocument()
  })

  it('shows the clear control when a value is present', async () => {
    const user = setupUser()
    render(AutocompleteHost, { props: { defaultValue: 'Next.js', clearable: true } })
    const clearControl = document.querySelector('[data-slot="autocomplete-clear"]') as HTMLElement
    expect(clearControl).toBeTruthy()
    await user.click(clearControl)
    await waitFor(() => {
      expect(document.querySelector('[data-slot="autocomplete-clear"]')).toBeNull()
    })
  })

  it('does not render the clear control when there is no value', () => {
    render(AutocompleteHost, { props: { clearable: true } })
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull()
  })

  it('fires onValueChange with a string on select', async () => {
    const user = setupUser()
    const onValueChange = vi.fn()
    render(AutocompleteHost, { props: { icon: true, onValueChange } })
    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    await user.click(await screen.findByText('Remix', overlay))
    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledWith('Remix')
    })
  })

  it('rotates the chevron when the popup opens via a named-group selector', async () => {
    const user = setupUser()
    render(AutocompleteHost, { props: { icon: true } })
    const iconBtn = document.querySelector('[data-slot="autocomplete-icon"]') as HTMLElement
    expect(iconBtn).not.toBeNull()
    expect(iconBtn.className).toContain('group/autocomplete-icon')
    const svg = iconBtn.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg!.getAttribute('class') ?? '').toContain('group-data-popup-open/autocomplete-icon:rotate-180')

    await user.click(iconBtn)
    await screen.findByText('Next.js', overlay)
    expect(iconBtn.getAttribute('data-popup-open') === '' || iconBtn.getAttribute('data-state') === 'open').toBe(true)
  })

  it('disables the icon and clear buttons when the input is disabled', () => {
    render(AutocompleteHost, { props: { icon: true, clearable: true, defaultValue: 'Astro', disabled: true } })
    const iconBtn = screen.getByRole('button', { name: 'Toggle popup' })
    const clear = screen.getByRole('button', { name: 'Clear selection' })
    expect(iconBtn).toBeDisabled()
    expect(clear).toBeDisabled()
  })

  it('renders a standalone AutocompleteTrigger that opens the popup', async () => {
    const user = setupUser()
    const { container } = render(AutocompleteHost, { props: { standaloneTrigger: true } })
    const trigger = container.querySelector('[data-slot="autocomplete-trigger"]') as HTMLElement
    expect(trigger).not.toBeNull()
    expect(trigger.tagName).toBe('BUTTON')
    await user.click(trigger)
    expect(await screen.findByText('Next.js', overlay)).toBeInTheDocument()
  })

  it('renders status chrome inside the popup', async () => {
    const user = setupUser()
    render(AutocompleteHost, { props: { icon: true, status: 'Loading…' } })
    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    expect(await screen.findByText('Loading…', overlay)).toBeInTheDocument()
    expect(screen.getByText('Loading…', overlay).closest('[data-slot="autocomplete-status"]')).not.toBeNull()
  })

  it('marks the input invalid inside Field', () => {
    render(AutocompleteHost, { props: { invalid: true } })
    expect(screen.getByRole('combobox').closest('[data-slot="autocomplete-input"]')).toHaveAttribute('data-invalid')
  })

  it('lays items out in a grid when grid is set', async () => {
    const user = setupUser()
    render(AutocompleteHost, { props: { icon: true, grid: true } })
    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    await screen.findByText('Next.js', overlay)
    const list = document.querySelector('[data-slot="autocomplete-list"]') as HTMLElement
    expect(list.style.gridTemplateColumns).toContain('repeat(2')
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(AutocompleteHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
