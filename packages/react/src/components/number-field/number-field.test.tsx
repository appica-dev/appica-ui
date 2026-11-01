import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Field, FieldLabel } from '../field/field'
import { NumberField } from './number-field'

function renderWithLabel(props: React.ComponentProps<typeof NumberField> = {}, labelText = 'Qty', id = 'qty') {
  return render(
    <>
      <label htmlFor={id}>{labelText}</label>
      <NumberField id={id} defaultValue={1} {...props} />
    </>,
  )
}

describe('NumberField', () => {
  it('renders an input associated with an external label via id/htmlFor', () => {
    renderWithLabel({}, 'Quantity', 'qty-1')
    const input = screen.getByLabelText('Quantity')
    expect(input).toHaveAttribute('id', 'qty-1')
    expect(input.tagName).toBe('INPUT')
  })

  it('renders decrement and increment buttons', () => {
    renderWithLabel()
    expect(screen.getByRole('button', { name: 'Decrease value' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Increase value' })).toBeInTheDocument()
  })

  it('increments and decrements the value via button clicks', async () => {
    const user = userEvent.setup()
    renderWithLabel({ defaultValue: 5 })
    const input = screen.getByLabelText('Qty') as HTMLInputElement

    await user.click(screen.getByRole('button', { name: 'Increase value' }))
    expect(input).toHaveValue('6')

    await user.click(screen.getByRole('button', { name: 'Decrease value' }))
    await user.click(screen.getByRole('button', { name: 'Decrease value' }))
    expect(input).toHaveValue('4')
  })

  it('fires onValueChange when value changes', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithLabel({ defaultValue: 0, onValueChange })

    await user.click(screen.getByRole('button', { name: 'Increase value' }))
    expect(onValueChange).toHaveBeenCalled()
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe(1)
  })

  it('disables interaction when disabled', async () => {
    const user = userEvent.setup()
    renderWithLabel({ disabled: true })
    const input = screen.getByLabelText('Qty')
    expect(input).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Increase value' }))
    expect(input).toHaveValue('1')
  })

  it('applies size classes to the root', () => {
    const { container } = renderWithLabel({ size: 'lg' })
    const root = container.querySelector('[data-slot="number-field"]')
    expect(root?.className).toContain('w-35')
    expect(root?.className).toContain('rounded-lg')
  })

  it('applies variant classes to the root', () => {
    const { container } = renderWithLabel({ variant: 'soft' })
    const root = container.querySelector('[data-slot="number-field"]')
    expect(root?.className).toContain('bg-background-muted')
  })

  it('merges custom className onto the root', () => {
    const { container } = renderWithLabel({ className: 'custom-x' })
    const root = container.querySelector('[data-slot="number-field"]')
    expect(root?.className).toContain('custom-x')
  })

  it('respects min and max bounds', async () => {
    const user = userEvent.setup()
    renderWithLabel({ defaultValue: 1, min: 0, max: 1 })
    const input = screen.getByLabelText('Qty') as HTMLInputElement

    await user.click(screen.getByRole('button', { name: 'Increase value' }))
    expect(input).toHaveValue('1')

    await user.click(screen.getByRole('button', { name: 'Decrease value' }))
    expect(input).toHaveValue('0')
    await user.click(screen.getByRole('button', { name: 'Decrease value' }))
    expect(input).toHaveValue('0')
  })

  it('renders an animated overlay mirroring the current value', () => {
    const { container } = renderWithLabel({ defaultValue: 7 })
    const overlay = container.querySelector('[data-slot="number-field-overlay"]')
    expect(overlay).not.toBeNull()
    expect(overlay?.textContent).toBe('7')
  })

  it('updates the overlay on button-press value changes', async () => {
    const user = userEvent.setup()
    const { container } = renderWithLabel({ defaultValue: 41 })

    await user.click(screen.getByRole('button', { name: 'Increase value' }))
    const overlay = container.querySelector('[data-slot="number-field-overlay"]')!

    // Two digit slots, regardless of in-flight animations.
    const slots = overlay.querySelectorAll('span.relative')
    expect(slots).toHaveLength(2)
    // Once animations settle, only the latest digit remains per slot.
    await waitFor(() => {
      expect(overlay.textContent).toBe('42')
    })
  })

  it('updates the overlay when typing directly into the input', async () => {
    const user = userEvent.setup()
    const { container } = renderWithLabel({ defaultValue: 1 })
    const input = screen.getByLabelText('Qty') as HTMLInputElement

    await user.clear(input)
    await user.type(input, '42')

    const overlay = container.querySelector('[data-slot="number-field-overlay"]')!
    await waitFor(() => {
      expect(overlay.textContent).toBe('42')
    })
  })

  it('hides the overlay while the input is focused and restores it on blur', async () => {
    const user = userEvent.setup()
    const { container } = renderWithLabel({ defaultValue: 1 })
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

  it('keeps the overlay visible during stepper presses even if the input was focused', async () => {
    const user = userEvent.setup()
    const { container } = renderWithLabel({ defaultValue: 1 })
    const input = screen.getByLabelText('Qty') as HTMLInputElement
    const overlay = container.querySelector('[data-slot="number-field-overlay"]')!
    const standaloneInvisible = /(^|\s)invisible(\s|$)/

    await user.click(input)
    expect(overlay.className).toMatch(standaloneInvisible)

    await user.click(screen.getByRole('button', { name: 'Increase value' }))
    expect(overlay.className).not.toMatch(standaloneInvisible)
  })

  it('bridges aria-invalid to data-invalid for error styling', () => {
    const { container } = renderWithLabel({ 'aria-invalid': true })
    const root = container.querySelector('[data-slot="number-field"]')
    expect(root).toHaveAttribute('aria-invalid', 'true')
    expect(root).toHaveAttribute('data-invalid')
  })

  it('does not set data-invalid when valid', () => {
    const { container } = renderWithLabel()
    expect(container.querySelector('[data-slot="number-field"]')).not.toHaveAttribute('data-invalid')
  })

  it('propagates data-invalid to the input and stepper buttons via Base UI context', async () => {
    const { Field } = await import('@base-ui/react/field')
    const { container } = render(
      <Field.Root invalid>
        <NumberField defaultValue={1} aria-label="Qty" />
      </Field.Root>,
    )
    expect(container.querySelector('[data-slot="number-field"]')).toHaveAttribute('data-invalid')
    expect(container.querySelector('[data-slot="number-field-input"]')).toHaveAttribute('data-invalid')
    expect(container.querySelector('[data-slot="number-field-increment"]')).toHaveAttribute('data-invalid')
    expect(container.querySelector('[data-slot="number-field-decrement"]')).toHaveAttribute('data-invalid')
  })

  it('snaps to 0 when the input is cleared and blurred', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderWithLabel({ defaultValue: 42, onValueChange })
    const input = screen.getByLabelText('Qty') as HTMLInputElement

    await user.clear(input)
    expect(input).toHaveValue('')

    input.blur()
    await waitFor(() => {
      expect(input).toHaveValue('0')
    })
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe(0)
  })

  it('snaps to min when the input is cleared and min is set', async () => {
    const user = userEvent.setup()
    renderWithLabel({ defaultValue: 5, min: 3 })
    const input = screen.getByLabelText('Qty') as HTMLInputElement

    await user.clear(input)
    input.blur()
    await waitFor(() => {
      expect(input).toHaveValue('3')
    })
  })

  it('has no accessibility violations', async () => {
    const { container } = renderWithLabel({}, 'Quantity', 'qty-a11y')
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('accessible name', () => {
    function getRoot(container: HTMLElement) {
      return container.querySelector('[data-slot="number-field"]')
    }

    it('names the input from a root aria-label, not the root', () => {
      const { container } = render(<NumberField defaultValue={1} aria-label="Quantity" />)
      expect(screen.getByRole('textbox', { name: 'Quantity' })).toHaveAttribute('data-slot', 'number-field-input')
      expect(getRoot(container)).not.toHaveAttribute('aria-label')
    })

    it('names the input from a root aria-labelledby, not the root', () => {
      const { container } = render(
        <>
          <span id="qty-label">Quantity</span>
          <NumberField defaultValue={1} aria-labelledby="qty-label" />
        </>,
      )
      expect(screen.getByRole('textbox', { name: 'Quantity' })).toHaveAttribute('aria-labelledby', 'qty-label')
      expect(getRoot(container)).not.toHaveAttribute('aria-labelledby')
    })

    it('keeps the input label from inputProps over the root label', () => {
      const { container } = render(
        <NumberField defaultValue={1} aria-label="Root label" inputProps={{ 'aria-label': 'Seats' }} />,
      )
      expect(screen.getByRole('textbox', { name: 'Seats' })).toBeInTheDocument()
      expect(getRoot(container)).not.toHaveAttribute('aria-label')
    })

    it('keeps the FieldLabel over the root label inside a Field', () => {
      const { container } = render(
        <Field>
          <FieldLabel>Seats</FieldLabel>
          <NumberField defaultValue={1} aria-label="Root label" />
        </Field>,
      )
      const input = screen.getByRole('textbox', { name: 'Seats' })
      expect(input).not.toHaveAttribute('aria-label')
      expect(getRoot(container)).not.toHaveAttribute('aria-label')
    })

    it('has no accessibility violations when labeled by a root aria-label', async () => {
      const { container } = render(<NumberField defaultValue={1} aria-label="Quantity" />)
      expect(await axe(container)).toHaveNoViolations()
    })

    it('has no accessibility violations inside a Field', async () => {
      const { container } = render(
        <Field>
          <FieldLabel>Seats</FieldLabel>
          <NumberField defaultValue={1} />
        </Field>,
      )
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
