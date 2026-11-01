import * as React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Field, FieldDescription, FieldError, FieldLabel } from '../field/field'
import { DateField } from './date-field'

function getSegment(name: 'day' | 'month' | 'year') {
  return screen.getByRole('spinbutton', { name })
}

function getRoot(container: HTMLElement) {
  return container.querySelector('[data-slot="date-field"]') as HTMLDivElement
}

const JUN_23 = new Date(2026, 5, 23)

describe('DateField', () => {
  it('renders three segments for the default MM/dd/yyyy format', () => {
    render(<DateField defaultValue={JUN_23} />)
    expect(getSegment('month')).toHaveTextContent('06')
    expect(getSegment('day')).toHaveTextContent('23')
    expect(getSegment('year')).toHaveTextContent('2026')
  })

  it('renders segments in the order of the format string', () => {
    render(<DateField defaultValue={JUN_23} format="yyyy-MM-dd" />)
    const segs = screen.getAllByRole('spinbutton')
    expect(segs[0]).toHaveAttribute('aria-label', 'year')
    expect(segs[1]).toHaveAttribute('aria-label', 'month')
    expect(segs[2]).toHaveAttribute('aria-label', 'day')
  })

  it('renders placeholders when no value is provided', () => {
    render(<DateField />)
    expect(getSegment('month')).toHaveTextContent('MM')
    expect(getSegment('day')).toHaveTextContent('DD')
    expect(getSegment('year')).toHaveTextContent('YYYY')
  })

  describe('clicking the field chrome', () => {
    it('focuses the first segment when the field is empty', () => {
      const { container } = render(<DateField />)
      fireEvent.mouseDown(getRoot(container))
      expect(getSegment('month')).toHaveFocus()
    })

    it('focuses the first empty segment when partially filled', async () => {
      const user = userEvent.setup()
      const { container } = render(<DateField />)
      await user.click(getSegment('month'))
      await user.keyboard('06') // fills month, leaving day + year empty
      fireEvent.mouseDown(getRoot(container))
      expect(getSegment('day')).toHaveFocus()
    })

    it('does not steal focus when a slot control is clicked', () => {
      render(<DateField endSlot={<button>clear</button>} />)
      fireEvent.mouseDown(screen.getByRole('button', { name: 'clear' }))
      expect(getSegment('month')).not.toHaveFocus()
    })
  })

  it('renders MMM and MMMM month-name segments', () => {
    const { rerender } = render(<DateField defaultValue={JUN_23} format="MMM d, yyyy" />)
    expect(getSegment('month')).toHaveTextContent('Jun')

    rerender(<DateField defaultValue={JUN_23} format="MMMM d, yyyy" />)
    expect(getSegment('month')).toHaveTextContent('June')
  })

  it('exposes aria spinbutton attributes per segment', () => {
    render(<DateField defaultValue={JUN_23} />)
    const month = getSegment('month')
    expect(month).toHaveAttribute('aria-valuemin', '1')
    expect(month).toHaveAttribute('aria-valuemax', '12')
    expect(month).toHaveAttribute('aria-valuenow', '6')
    expect(month).toHaveAttribute('aria-valuetext', '6')

    expect(getSegment('day')).toHaveAttribute('aria-valuemax', '30')
    expect(getSegment('year')).toHaveAttribute('aria-valuemax', '9999')
  })

  it('announces month names via aria-valuetext for MMM/MMMM tokens', () => {
    render(<DateField defaultValue={JUN_23} format="MMM d, yyyy" />)
    expect(getSegment('month')).toHaveAttribute('aria-valuetext', 'June')
  })

  it('increments and decrements with ArrowUp / ArrowDown', async () => {
    const user = userEvent.setup()
    render(<DateField defaultValue={JUN_23} />)
    const month = getSegment('month')
    month.focus()

    await user.keyboard('{ArrowUp}')
    expect(month).toHaveTextContent('07')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(month).toHaveTextContent('05')
  })

  it('wraps around at min/max', async () => {
    const user = userEvent.setup()
    render(<DateField defaultValue={new Date(2026, 11, 23)} />)
    const month = getSegment('month')
    month.focus()

    await user.keyboard('{ArrowUp}')
    expect(month).toHaveTextContent('01')
    await user.keyboard('{ArrowDown}')
    expect(month).toHaveTextContent('12')
  })

  it('clamps day when month switches to a shorter one', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateField defaultValue={new Date(2026, 2, 31)} onValueChange={onValueChange} />)
    const month = getSegment('month')
    month.focus()

    await user.keyboard('{ArrowDown}')
    expect(getSegment('day')).toHaveTextContent('28')
  })

  it('types digits and auto-advances when buffer fills', async () => {
    const user = userEvent.setup()
    render(<DateField />)
    const month = getSegment('month')
    month.focus()

    await user.keyboard('12')
    expect(month).toHaveTextContent('12')
    expect(getSegment('day')).toHaveFocus()
  })

  it('clamps on overflow and replaces with the new digit', async () => {
    const user = userEvent.setup()
    render(<DateField />)
    const month = getSegment('month')
    month.focus()

    await user.keyboard('13')
    expect(month).toHaveTextContent('03')
    expect(getSegment('day')).toHaveFocus()
  })

  it('auto-advances early when the next digit could not fit', async () => {
    const user = userEvent.setup()
    render(<DateField />)
    const month = getSegment('month')
    month.focus()

    await user.keyboard('2')
    expect(month).toHaveTextContent('02')
    expect(getSegment('day')).toHaveFocus()
  })

  it('separator keys commit current value and advance focus', async () => {
    const user = userEvent.setup()
    render(<DateField />)
    const month = getSegment('month')
    month.focus()
    await user.keyboard('1/')
    expect(month).toHaveTextContent('01')
    expect(getSegment('day')).toHaveFocus()
  })

  it('ArrowLeft / ArrowRight move focus between segments', async () => {
    const user = userEvent.setup()
    render(<DateField defaultValue={JUN_23} />)
    getSegment('month').focus()
    await user.keyboard('{ArrowRight}')
    expect(getSegment('day')).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(getSegment('month')).toHaveFocus()
  })

  it('Home / End jump to first / last segment', async () => {
    const user = userEvent.setup()
    render(<DateField defaultValue={JUN_23} />)
    getSegment('day').focus()
    await user.keyboard('{End}')
    expect(getSegment('year')).toHaveFocus()
    await user.keyboard('{Home}')
    expect(getSegment('month')).toHaveFocus()
  })

  it('Backspace clears the segment, then moves to the previous one', async () => {
    const user = userEvent.setup()
    render(<DateField defaultValue={JUN_23} />)
    const day = getSegment('day')
    day.focus()
    await user.keyboard('{Backspace}')
    expect(day).toHaveTextContent('DD')
    await user.keyboard('{Backspace}')
    expect(getSegment('month')).toHaveFocus()
  })

  it('letter keys cycle months in a MMMM segment', async () => {
    const user = userEvent.setup()
    render(<DateField defaultValue={JUN_23} format="MMMM d, yyyy" />)
    const month = getSegment('month')
    month.focus()
    await user.keyboard('j')
    expect(month).toHaveTextContent('July')
    await user.keyboard('j')
    expect(month).toHaveTextContent('January')
  })

  it('ignores printable keys combined with a modifier (Ctrl/Cmd)', async () => {
    const user = userEvent.setup()
    render(<DateField defaultValue={JUN_23} />)
    const month = getSegment('month')
    month.focus()

    await user.keyboard('{Control>}c{/Control}')
    expect(month).toHaveTextContent('06')
    await user.keyboard('{Meta>}v{/Meta}')
    expect(month).toHaveTextContent('06')
  })

  it('does not throw when rendered with an invalid Date', () => {
    expect(() => render(<DateField value={new Date('garbage')} />)).not.toThrow()
  })

  it('fires onValueChange with a Date when all parts are valid', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateField defaultValue={JUN_23} onValueChange={onValueChange} />)
    getSegment('day').focus()
    await user.keyboard('{ArrowUp}')

    const last = onValueChange.mock.calls.at(-1)?.[0]
    expect(last).toBeInstanceOf(Date)
    expect(last.getDate()).toBe(24)
    expect(last.getMonth()).toBe(5)
    expect(last.getFullYear()).toBe(2026)
  })

  it('supports controlled value updates from outside', () => {
    const { rerender } = render(<DateField value={JUN_23} />)
    expect(getSegment('day')).toHaveTextContent('23')

    rerender(<DateField value={new Date(2030, 0, 5)} />)
    expect(getSegment('month')).toHaveTextContent('01')
    expect(getSegment('day')).toHaveTextContent('05')
    expect(getSegment('year')).toHaveTextContent('2030')
  })

  it('keeps partial input visible when controlled with null', async () => {
    const user = userEvent.setup()
    render(<DateField value={null} />)
    const day = getSegment('day')
    await user.click(day)
    await user.keyboard('0')
    expect(day).toHaveTextContent('00')

    const year = getSegment('year')
    await user.click(year)
    await user.keyboard('2')
    expect(year).toHaveTextContent('2')
  })

  it('does not fire onValueChange(null) for intermediate invalid input', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateField value={JUN_23} onValueChange={onValueChange} />)
    onValueChange.mockClear()

    // Typing '0' in day produces day=0 which is not a real date -> no callback.
    await user.click(getSegment('day'))
    await user.keyboard('0')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('fires onValueChange(null) only when every segment is cleared', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateField defaultValue={JUN_23} onValueChange={onValueChange} />)
    onValueChange.mockClear()

    // Backspace just the day -> still has month/year, no clear-all callback.
    await user.click(getSegment('day'))
    await user.keyboard('{Backspace}')
    expect(onValueChange).not.toHaveBeenCalled()

    // Clear the rest -> finally fires null.
    await user.click(getSegment('month'))
    await user.keyboard('{Backspace}')
    await user.click(getSegment('year'))
    await user.keyboard('{Backspace}')
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  it('renders the hidden input only when name is provided', () => {
    const { container, rerender } = render(<DateField defaultValue={JUN_23} />)
    expect(container.querySelector('input[type="hidden"]')).toBeNull()

    rerender(<DateField defaultValue={JUN_23} name="dob" />)
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(hidden).not.toBeNull()
    expect(hidden.name).toBe('dob')
    expect(hidden.value).toBe('2026-06-23')
  })

  it('prevents mutation when disabled and removes segments from the tab order', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateField defaultValue={JUN_23} disabled onValueChange={onValueChange} />)
    const month = getSegment('month')
    expect(month).toHaveAttribute('tabindex', '-1')

    month.focus()
    await user.keyboard('{ArrowUp}')
    expect(month).toHaveTextContent('06')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('allows navigation but blocks mutation when readOnly', async () => {
    const user = userEvent.setup()
    render(<DateField defaultValue={JUN_23} readOnly />)
    getSegment('month').focus()
    await user.keyboard('{ArrowRight}')
    expect(getSegment('day')).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(getSegment('day')).toHaveTextContent('23')
  })

  it('merges custom className onto the root and applies size / variant classes', () => {
    const { container } = render(<DateField defaultValue={JUN_23} size="lg" variant="soft" className="custom-x" />)
    const root = getRoot(container)
    expect(root.className).toContain('custom-x')
    expect(root.className).toContain('h-12')
    expect(root.className).toContain('bg-background-muted')
  })

  it('passes data-invalid through aria-invalid', () => {
    const { container } = render(<DateField defaultValue={JUN_23} aria-invalid />)
    expect(getRoot(container)).toHaveAttribute('data-invalid')
  })

  it('inherits invalid and disabled from a surrounding Field', async () => {
    const { Field } = await import('@base-ui/react/field')
    const { container } = render(
      <Field.Root invalid disabled>
        <DateField defaultValue={JUN_23} />
      </Field.Root>,
    )
    const root = getRoot(container)
    expect(root).toHaveAttribute('data-invalid')
    expect(root).toHaveAttribute('data-disabled')
  })

  describe('inside a Field', () => {
    function renderInField(props: React.ComponentProps<typeof DateField> = {}, invalid = false) {
      return render(
        <Field invalid={invalid}>
          <FieldLabel>Date of birth</FieldLabel>
          <DateField defaultValue={JUN_23} {...props} />
          <FieldDescription>As shown on your passport.</FieldDescription>
          <FieldError match>Enter a valid date.</FieldError>
        </Field>,
      )
    }

    it('takes its accessible name from the FieldLabel', () => {
      renderInField()
      const group = screen.getByRole('group', { name: 'Date of birth' })
      expect(group).toHaveAttribute('data-slot', 'date-field')
      expect(screen.getByText('Date of birth')).not.toHaveAttribute('for')
    })

    it('is described by the FieldDescription', () => {
      renderInField()
      const description = screen.getByText('As shown on your passport.')
      expect(screen.getByRole('group', { name: 'Date of birth' })).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(description.id),
      )
    })

    it('is described by the FieldError and marks every segment invalid', () => {
      renderInField({}, true)
      const group = screen.getByRole('group', { name: 'Date of birth' })
      const error = screen.getByText('Enter a valid date.')
      expect(group).toHaveAttribute('aria-describedby', expect.stringContaining(error.id))
      expect(group).toHaveAttribute('aria-invalid', 'true')
      for (const segment of screen.getAllByRole('spinbutton')) {
        expect(segment).toHaveAttribute('aria-invalid', 'true')
      }
    })

    it('lets consumer aria-label and aria-describedby win over the Field wiring', () => {
      renderInField({ 'aria-label': 'Birthday', 'aria-describedby': 'custom-hint' })
      const group = screen.getByRole('group', { name: 'Birthday' })
      expect(group).not.toHaveAttribute('aria-labelledby')
      expect(group).toHaveAttribute('aria-describedby', 'custom-hint')
    })

    it('lets a consumer aria-labelledby win over the FieldLabel', () => {
      const { container } = render(
        <Field>
          <FieldLabel>Date of birth</FieldLabel>
          <span id="custom-label">Birthday</span>
          <DateField defaultValue={JUN_23} aria-labelledby="custom-label" />
        </Field>,
      )
      expect(getRoot(container)).toHaveAttribute('aria-labelledby', 'custom-label')
      expect(screen.getByRole('group', { name: 'Birthday' })).toBe(getRoot(container))
    })

    it('lets a consumer aria-invalid win on the group and segments', () => {
      renderInField({ 'aria-invalid': false }, true)
      const group = screen.getByRole('group', { name: 'Date of birth' })
      expect(group).toHaveAttribute('aria-invalid', 'false')
      for (const segment of screen.getAllByRole('spinbutton')) {
        expect(segment).toHaveAttribute('aria-invalid', 'false')
      }
    })

    it('does not mark segments invalid when the field is valid', () => {
      renderInField()
      for (const segment of screen.getAllByRole('spinbutton')) {
        expect(segment).not.toHaveAttribute('aria-invalid')
      }
    })

    it('has no accessibility violations when labeled, described and invalid', async () => {
      const { container } = renderInField({}, true)
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  it('renders startSlot and endSlot containers', () => {
    const { container } = render(
      <DateField
        defaultValue={JUN_23}
        startSlot={<span data-testid="s">s</span>}
        endSlot={<span data-testid="e">e</span>}
      />,
    )
    expect(container.querySelector('[data-slot="date-field-start"]')).toContainElement(screen.getByTestId('s'))
    expect(container.querySelector('[data-slot="date-field-end"]')).toContainElement(screen.getByTestId('e'))
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <label id="dob-label">Date of birth</label>
        <DateField defaultValue={JUN_23} aria-labelledby="dob-label" />
      </>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
