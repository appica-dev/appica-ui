import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import NumberFieldHost from './number-field.test-host.svelte'
import NumberField from './number-field.svelte'

describe('NumberField', () => {
  it('renders an input associated with an external label via id', () => {
    render(NumberFieldHost, { props: { label: 'Quantity', id: 'qty-1' } })
    const input = screen.getByLabelText('Quantity')
    expect(input).toHaveAttribute('id', 'qty-1')
    expect(input.tagName).toBe('INPUT')
  })

  it('renders decrement and increment buttons', () => {
    render(NumberFieldHost)
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Increase value' })).toBeInTheDocument()
  })

  it('increments and decrements the value via button clicks', async () => {
    const user = userEvent.setup()
    render(NumberFieldHost, { props: { defaultValue: 5 } })
    const input = screen.getByLabelText('Qty') as HTMLInputElement

    await user.click(screen.getByRole('button', { name: 'Increase value' }))
    expect(input).toHaveValue('6')

    await user.click(screen.getByRole('button', { name: 'Decrease value' }))
    await user.click(screen.getByRole('button', { name: 'Decrease value' }))
    expect(input).toHaveValue('4')
  })

  it('disables interaction when disabled', async () => {
    const user = userEvent.setup()
    render(NumberFieldHost, { props: { disabled: true } })
    const input = screen.getByLabelText('Qty')
    expect(input).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Increase value' }))
    expect(input).toHaveValue('1')
  })

  it('applies size classes to the root', () => {
    const { container } = render(NumberFieldHost, { props: { size: 'lg' } })
    const root = container.querySelector('[data-slot="number-field"]')
    expect(root?.className).toContain('w-35')
    expect(root?.className).toContain('rounded-lg')
  })

  it('applies variant classes to the root', () => {
    const { container } = render(NumberFieldHost, { props: { variant: 'soft' } })
    const root = container.querySelector('[data-slot="number-field"]')
    expect(root?.className).toContain('bg-background-muted')
  })

  it('respects min and max bounds', async () => {
    const user = userEvent.setup()
    render(NumberFieldHost, { props: { defaultValue: 1, min: 0, max: 1 } })
    const input = screen.getByLabelText('Qty') as HTMLInputElement

    await user.click(screen.getByRole('button', { name: 'Increase value' }))
    expect(input).toHaveValue('1')

    await user.click(screen.getByRole('button', { name: 'Decrease value' }))
    expect(input).toHaveValue('0')
    await user.click(screen.getByRole('button', { name: 'Decrease value' }))
    expect(input).toHaveValue('0')
  })

  it('renders an animated overlay mirroring the current value', () => {
    const { container } = render(NumberFieldHost, { props: { defaultValue: 7 } })
    const overlay = container.querySelector('[data-slot="number-field-overlay"]')
    expect(overlay).not.toBeNull()
    expect(overlay?.textContent).toBe('7')
  })

  it('hides the overlay while the input is focused and restores it on blur', async () => {
    const user = userEvent.setup()
    const { container } = render(NumberFieldHost, { props: { defaultValue: 1 } })
    const input = screen.getByLabelText('Qty') as HTMLInputElement
    const overlay = container.querySelector('[data-slot="number-field-overlay"]')!

    const standaloneInvisible = /(^|\s)invisible(\s|$)/
    expect(overlay.className).not.toMatch(standaloneInvisible)
    expect(overlay.className).toContain('peer-placeholder-shown:invisible')

    await user.click(input)
    expect(overlay.className).toMatch(standaloneInvisible)

    input.blur()
    await waitFor(() => {
      expect(overlay.className).not.toMatch(standaloneInvisible)
    })
  })

  it('marks the field invalid inside Field', () => {
    const { container } = render(NumberFieldHost, { props: { invalid: true } })
    expect(container.querySelector('[data-slot="number-field"]')).toHaveAttribute('data-invalid')
    expect(container.querySelector('[data-slot="number-field-input"]')).toHaveAttribute('data-invalid')
  })

  it('snaps to 0 when the input is cleared and blurred', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(NumberField, { props: { id: 'qty', defaultValue: 42, onValueChange } })
    const input = document.getElementById('qty') as HTMLInputElement

    await user.clear(input)
    expect(input).toHaveValue('')

    input.blur()
    await waitFor(() => {
      expect(input).toHaveValue('0')
    })
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe(0)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(NumberFieldHost, { props: { label: 'Quantity', id: 'qty-a11y' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
