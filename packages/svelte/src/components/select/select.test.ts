import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import SelectHost from './select.test-host.svelte'

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })

describe('Select', () => {
  it('tags the trigger with data-slot', () => {
    render(SelectHost)
    expect(screen.getByRole('combobox').getAttribute('data-slot')).toBe('select-trigger')
  })

  it('does not render content before being opened', () => {
    render(SelectHost)
    expect(screen.queryByText('Orange')).toBeNull()
  })

  it('opens on click and selects an item', async () => {
    const user = setupUser()
    render(SelectHost)
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('Lemon', { hidden: true }))
    await waitFor(() => {
      expect(screen.queryByText('Strawberry', { hidden: true })).toBeNull()
    })
  })

  it('shows a placeholder', () => {
    render(SelectHost, { props: { placeholder: 'Pick a fruit' } })
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick a fruit')
  })

  it('shows the clear control when a value is present', async () => {
    const user = setupUser()
    render(SelectHost, { props: { defaultValue: 'orange', clearable: true } })
    const clearControl = document.querySelector('[data-slot="select-clear"]') as HTMLElement
    expect(clearControl).toBeTruthy()
    await user.click(clearControl)
    await waitFor(() => {
      expect(document.querySelector('[data-slot="select-clear"]')).toBeNull()
    })
  })

  it('clears via Backspace on the trigger', async () => {
    const user = setupUser()
    render(SelectHost, { props: { defaultValue: 'orange', clearable: true } })
    const trigger = screen.getByRole('combobox')
    trigger.focus()
    await user.keyboard('{Backspace}')
    await waitFor(() => {
      expect(document.querySelector('[data-slot="select-clear"]')).toBeNull()
    })
  })

  it('supports multiple selection', async () => {
    const user = setupUser()
    render(SelectHost, { props: { multiple: true } })
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByText('Orange', { hidden: true }))
    await user.click(await screen.findByText('Lemon', { hidden: true }))
    const orange = screen.getByText('Orange', { hidden: true }).closest('[data-slot="select-item"]')
    const lemon = screen.getByText('Lemon', { hidden: true }).closest('[data-slot="select-item"]')
    expect(orange).toHaveAttribute('data-selected')
    expect(lemon).toHaveAttribute('data-selected')
  })

  it('marks the trigger invalid inside Field', () => {
    render(SelectHost, { props: { invalid: true } })
    expect(screen.getByRole('combobox')).toHaveAttribute('data-invalid')
  })

  it('renders groups', async () => {
    const user = setupUser()
    render(SelectHost)
    await user.click(screen.getByRole('combobox'))
    expect(await screen.findByText('Citrus', { hidden: true })).toBeInTheDocument()
    expect(screen.getByText('Berries', { hidden: true })).toBeInTheDocument()
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(SelectHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
