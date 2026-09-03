import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import ComboboxHost from './combobox.test-host.svelte'

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })
const overlay = { hidden: true as const }

describe('Combobox', () => {
  it('tags the input group with data-slot', () => {
    render(ComboboxHost)
    const input = screen.getByRole('combobox')
    expect(input.closest('[data-slot="combobox-input"]')).not.toBeNull()
  })

  it('does not render content before being opened', () => {
    render(ComboboxHost)
    expect(screen.queryByText('SvelteKit')).toBeNull()
  })

  it('opens on toggle and selects an item', async () => {
    const user = setupUser()
    render(ComboboxHost)
    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    await user.click(await screen.findByText('SvelteKit', overlay))
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('SvelteKit')
    })
  })

  it('shows the clear control when a value is present', async () => {
    const user = setupUser()
    render(ComboboxHost, { props: { defaultValue: 'Next.js', clearable: true } })
    const clearControl = document.querySelector('[data-slot="combobox-clear"]') as HTMLElement
    expect(clearControl).toBeTruthy()
    await user.click(clearControl)
    await waitFor(() => {
      expect(document.querySelector('[data-slot="combobox-clear"]')).toBeNull()
    })
  })

  it('supports multiple selection', async () => {
    const user = setupUser()
    render(ComboboxHost, { props: { multiple: true } })
    await user.click(screen.getByRole('button', { name: 'Toggle popup' }))
    await user.click(await screen.findByText('Next.js', overlay))
    await user.click(await screen.findByText('SvelteKit', overlay))
    const next = screen.getByText('Next.js', overlay).closest('[data-slot="combobox-item"]')
    const svelte = screen.getByText('SvelteKit', overlay).closest('[data-slot="combobox-item"]')
    expect(next).toHaveAttribute('data-selected')
    expect(svelte).toHaveAttribute('data-selected')
  })

  it('renders chips for selected multiple values and removes them', async () => {
    const user = setupUser()
    render(ComboboxHost, { props: { chips: true, defaultValue: ['Next.js'] } })
    expect(screen.getByText('Next.js').closest('[data-slot="combobox-chip"]')).not.toBeNull()
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    await waitFor(() => {
      expect(document.querySelector('[data-slot="combobox-chip"]')).toBeNull()
    })
  })

  it('marks the input invalid inside Field', () => {
    render(ComboboxHost, { props: { invalid: true } })
    expect(screen.getByRole('combobox').closest('[data-slot="combobox-input"]')).toHaveAttribute('data-invalid')
  })

  it('hides the toggle when icon is false', () => {
    render(ComboboxHost, { props: { icon: false } })
    expect(screen.queryByRole('button', { name: 'Toggle popup' })).toBeNull()
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(ComboboxHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
