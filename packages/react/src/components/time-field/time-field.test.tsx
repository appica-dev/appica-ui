import * as React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Field, FieldDescription, FieldError, FieldLabel } from '../field/field'
import { TimeField } from './time-field'

function getSegments(name: 'hour' | 'minute' | 'second' | 'period') {
  return screen.getAllByRole('spinbutton', { name })
}

function getSegment(name: 'hour' | 'minute' | 'second' | 'period') {
  return screen.getByRole('spinbutton', { name })
}

function getRoot(container: HTMLElement) {
  return container.querySelector('[data-slot="time-field"]') as HTMLDivElement
}

describe('TimeField', () => {
  it('renders two segments for the default HH:mm format', () => {
    render(<TimeField defaultValue="09:30" />)
    expect(getSegment('hour')).toHaveTextContent('09')
    expect(getSegment('minute')).toHaveTextContent('30')
    expect(screen.queryAllByRole('spinbutton')).toHaveLength(2)
  })

  describe('clicking the field chrome', () => {
    it('focuses the first segment when the field is empty', () => {
      const { container } = render(<TimeField />)
      fireEvent.mouseDown(getRoot(container))
      expect(getSegment('hour')).toHaveFocus()
    })

    it('focuses the first empty segment when partially filled', async () => {
      const user = userEvent.setup()
      const { container } = render(<TimeField />)
      await user.click(getSegment('hour'))
      await user.keyboard('09') // fills hour, leaving minute empty
      fireEvent.mouseDown(getRoot(container))
      expect(getSegment('minute')).toHaveFocus()
    })

    it('does not steal focus when a slot control is clicked', () => {
      render(<TimeField endSlot={<button>clear</button>} />)
      fireEvent.mouseDown(screen.getByRole('button', { name: 'clear' }))
      expect(getSegment('hour')).not.toHaveFocus()
    })
  })

  it('renders three segments including a period for the 12h format', () => {
    render(<TimeField defaultValue="13:05" format="hh:mm a" />)
    expect(getSegment('hour')).toHaveTextContent('01')
    expect(getSegment('minute')).toHaveTextContent('05')
    expect(getSegment('period')).toHaveTextContent('PM')
  })

  it('renders placeholders when no value is provided', () => {
    render(<TimeField />)
    expect(getSegment('hour')).toHaveTextContent('HH')
    expect(getSegment('minute')).toHaveTextContent('mm')
  })

  it('renders the seconds segment when the format includes ss', () => {
    render(<TimeField defaultValue="09:30:45" format="HH:mm:ss" />)
    expect(getSegment('second')).toHaveTextContent('45')
  })

  it('exposes aria spinbutton attributes per segment', () => {
    render(<TimeField defaultValue="09:30" />)
    const hour = getSegment('hour')
    expect(hour).toHaveAttribute('aria-valuemin', '0')
    expect(hour).toHaveAttribute('aria-valuemax', '23')
    expect(hour).toHaveAttribute('aria-valuenow', '9')

    const minute = getSegment('minute')
    expect(minute).toHaveAttribute('aria-valuemax', '59')
  })

  it('uses the 12h range on hh segments and announces AM/PM via aria-valuetext on the period', () => {
    render(<TimeField defaultValue="13:00" format="hh:mm a" />)
    const hour = getSegment('hour')
    expect(hour).toHaveAttribute('aria-valuemin', '1')
    expect(hour).toHaveAttribute('aria-valuemax', '12')
    expect(hour).toHaveAttribute('aria-valuenow', '1')

    const period = getSegment('period')
    expect(period).toHaveAttribute('aria-valuetext', 'PM')
    expect(period).toHaveAttribute('aria-valuemin', '0')
    expect(period).toHaveAttribute('aria-valuemax', '1')
    expect(period).toHaveAttribute('aria-valuenow', '1')
  })

  it('increments and decrements with ArrowUp / ArrowDown', async () => {
    const user = userEvent.setup()
    render(<TimeField defaultValue="09:30" />)
    const hour = getSegment('hour')
    hour.focus()

    await user.keyboard('{ArrowUp}')
    expect(hour).toHaveTextContent('10')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(hour).toHaveTextContent('08')
  })

  it('wraps around at min/max for hours', async () => {
    const user = userEvent.setup()
    render(<TimeField defaultValue="23:00" />)
    const hour = getSegment('hour')
    hour.focus()

    await user.keyboard('{ArrowUp}')
    expect(hour).toHaveTextContent('00')
    await user.keyboard('{ArrowDown}')
    expect(hour).toHaveTextContent('23')
  })

  it('wraps around at min/max for minutes', async () => {
    const user = userEvent.setup()
    render(<TimeField defaultValue="09:59" />)
    const minute = getSegment('minute')
    minute.focus()

    await user.keyboard('{ArrowUp}')
    expect(minute).toHaveTextContent('00')
    await user.keyboard('{ArrowDown}')
    expect(minute).toHaveTextContent('59')
  })

  it('types digits and auto-advances when buffer fills', async () => {
    const user = userEvent.setup()
    render(<TimeField />)
    const hour = getSegment('hour')
    hour.focus()

    await user.keyboard('12')
    expect(hour).toHaveTextContent('12')
    expect(getSegment('minute')).toHaveFocus()
  })

  it('clamps on overflow and replaces with the new digit', async () => {
    const user = userEvent.setup()
    render(<TimeField />)
    const hour = getSegment('hour')
    hour.focus()

    await user.keyboard('25')
    expect(hour).toHaveTextContent('05')
    expect(getSegment('minute')).toHaveFocus()
  })

  it('auto-advances early when the next digit could not fit', async () => {
    const user = userEvent.setup()
    render(<TimeField />)
    const hour = getSegment('hour')
    hour.focus()

    await user.keyboard('3')
    expect(hour).toHaveTextContent('03')
    expect(getSegment('minute')).toHaveFocus()
  })

  it('separator keys (: and /) advance focus', async () => {
    const user = userEvent.setup()
    render(<TimeField />)
    const hour = getSegment('hour')
    hour.focus()
    await user.keyboard('9:')
    expect(hour).toHaveTextContent('09')
    expect(getSegment('minute')).toHaveFocus()
  })

  it('ArrowLeft / ArrowRight move focus between segments', async () => {
    const user = userEvent.setup()
    render(<TimeField defaultValue="09:30" />)
    getSegment('hour').focus()
    await user.keyboard('{ArrowRight}')
    expect(getSegment('minute')).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(getSegment('hour')).toHaveFocus()
  })

  it('Home / End jump to first / last segment', async () => {
    const user = userEvent.setup()
    render(<TimeField defaultValue="13:30" format="hh:mm a" />)
    getSegment('minute').focus()
    await user.keyboard('{End}')
    expect(getSegment('period')).toHaveFocus()
    await user.keyboard('{Home}')
    expect(getSegment('hour')).toHaveFocus()
  })

  it('Backspace clears the segment, then moves to the previous one', async () => {
    const user = userEvent.setup()
    render(<TimeField defaultValue="09:30" />)
    const minute = getSegment('minute')
    minute.focus()
    await user.keyboard('{Backspace}')
    expect(minute).toHaveTextContent('mm')
    await user.keyboard('{Backspace}')
    expect(getSegment('hour')).toHaveFocus()
  })

  it('period segment toggles AM↔PM with ArrowUp/ArrowDown', async () => {
    const user = userEvent.setup()
    render(<TimeField defaultValue="09:30" format="hh:mm a" />)
    const period = getSegment('period')
    period.focus()

    expect(period).toHaveTextContent('AM')
    await user.keyboard('{ArrowUp}')
    expect(period).toHaveTextContent('PM')
    await user.keyboard('{ArrowDown}')
    expect(period).toHaveTextContent('AM')
  })

  it('period segment accepts a/p letter keys', async () => {
    const user = userEvent.setup()
    render(<TimeField defaultValue="09:30" format="hh:mm a" />)
    const period = getSegment('period')
    period.focus()

    await user.keyboard('p')
    expect(period).toHaveTextContent('PM')
    await user.keyboard('a')
    expect(period).toHaveTextContent('AM')
  })

  it('stores 12 AM as 24h 00 in the hidden input', () => {
    const { container } = render(<TimeField defaultValue="00:15" format="hh:mm a" name="t" />)
    expect(getSegment('hour')).toHaveTextContent('12')
    expect(getSegment('period')).toHaveTextContent('AM')
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(hidden.value).toBe('00:15')
  })

  it('stores 12 PM as 24h 12 in the hidden input', () => {
    const { container } = render(<TimeField defaultValue="12:00" format="hh:mm a" name="t" />)
    expect(getSegment('hour')).toHaveTextContent('12')
    expect(getSegment('period')).toHaveTextContent('PM')
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(hidden.value).toBe('12:00')
  })

  it('fires onValueChange with an HH:mm string when all parts are valid', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimeField defaultValue="09:30" onValueChange={onValueChange} />)
    getSegment('minute').focus()
    await user.keyboard('{ArrowUp}')

    const last = onValueChange.mock.calls.at(-1)?.[0]
    expect(last).toBe('09:31')
  })

  it('fires onValueChange with HH:mm:ss when format includes seconds', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimeField defaultValue="09:30:00" format="HH:mm:ss" onValueChange={onValueChange} />)
    getSegment('second').focus()
    await user.keyboard('{ArrowUp}')

    const last = onValueChange.mock.calls.at(-1)?.[0]
    expect(last).toBe('09:30:01')
  })

  it('supports controlled value updates from outside', () => {
    const { rerender } = render(<TimeField value="09:30" />)
    expect(getSegment('hour')).toHaveTextContent('09')
    expect(getSegment('minute')).toHaveTextContent('30')

    rerender(<TimeField value="17:05" />)
    expect(getSegment('hour')).toHaveTextContent('17')
    expect(getSegment('minute')).toHaveTextContent('05')
  })

  it('renders the hidden input only when name is provided', () => {
    const { container, rerender } = render(<TimeField defaultValue="09:30" />)
    expect(container.querySelector('input[type="hidden"]')).toBeNull()

    rerender(<TimeField defaultValue="09:30" name="t" />)
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(hidden).not.toBeNull()
    expect(hidden.name).toBe('t')
    expect(hidden.value).toBe('09:30')
  })

  it('hidden input always uses 24h format even when displayed in 12h', () => {
    const { container } = render(<TimeField defaultValue="14:30" format="hh:mm a" name="t" />)
    expect(getSegment('hour')).toHaveTextContent('02')
    expect(getSegment('period')).toHaveTextContent('PM')
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(hidden.value).toBe('14:30')
  })

  it('hidden input includes seconds when the format includes seconds', () => {
    const { container } = render(<TimeField defaultValue="09:30:45" format="HH:mm:ss" name="t" />)
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement
    expect(hidden.value).toBe('09:30:45')
  })

  it('prevents mutation when disabled and removes segments from the tab order', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimeField defaultValue="09:30" disabled onValueChange={onValueChange} />)
    const hour = getSegment('hour')
    expect(hour).toHaveAttribute('tabindex', '-1')

    hour.focus()
    await user.keyboard('{ArrowUp}')
    expect(hour).toHaveTextContent('09')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('allows navigation but blocks mutation when readOnly', async () => {
    const user = userEvent.setup()
    render(<TimeField defaultValue="09:30" readOnly />)
    getSegment('hour').focus()
    await user.keyboard('{ArrowRight}')
    expect(getSegment('minute')).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(getSegment('minute')).toHaveTextContent('30')
  })

  it('merges custom className onto the root and applies size / variant classes', () => {
    const { container } = render(<TimeField defaultValue="09:30" size="lg" variant="soft" className="custom-x" />)
    const root = getRoot(container)
    expect(root.className).toContain('custom-x')
    expect(root.className).toContain('h-12')
    expect(root.className).toContain('bg-background-muted')
  })

  it('passes data-invalid through aria-invalid', () => {
    const { container } = render(<TimeField defaultValue="09:30" aria-invalid />)
    expect(getRoot(container)).toHaveAttribute('data-invalid')
  })

  it('inherits invalid and disabled from a surrounding Field', async () => {
    const { Field } = await import('@base-ui/react/field')
    const { container } = render(
      <Field.Root invalid disabled>
        <TimeField defaultValue="09:30" />
      </Field.Root>,
    )
    const root = getRoot(container)
    expect(root).toHaveAttribute('data-invalid')
    expect(root).toHaveAttribute('data-disabled')
  })

  describe('inside a Field', () => {
    function renderInField(props: React.ComponentProps<typeof TimeField> = {}, invalid = false) {
      return render(
        <Field invalid={invalid}>
          <FieldLabel>Start time</FieldLabel>
          <TimeField defaultValue="09:30" {...props} />
          <FieldDescription>Local time.</FieldDescription>
          <FieldError match>Enter a valid time.</FieldError>
        </Field>,
      )
    }

    it('takes its accessible name from the FieldLabel', () => {
      renderInField()
      const group = screen.getByRole('group', { name: 'Start time' })
      expect(group).toHaveAttribute('data-slot', 'time-field')
      expect(screen.getByText('Start time')).not.toHaveAttribute('for')
    })

    it('is described by the FieldDescription', () => {
      renderInField()
      const description = screen.getByText('Local time.')
      expect(screen.getByRole('group', { name: 'Start time' })).toHaveAttribute(
        'aria-describedby',
        expect.stringContaining(description.id),
      )
    })

    it('is described by the FieldError and marks every segment invalid', () => {
      renderInField({ format: 'hh:mm a' }, true)
      const group = screen.getByRole('group', { name: 'Start time' })
      const error = screen.getByText('Enter a valid time.')
      expect(group).toHaveAttribute('aria-describedby', expect.stringContaining(error.id))
      expect(group).toHaveAttribute('aria-invalid', 'true')
      const segments = screen.getAllByRole('spinbutton')
      expect(segments).toHaveLength(3)
      for (const segment of segments) {
        expect(segment).toHaveAttribute('aria-invalid', 'true')
      }
    })

    it('lets consumer aria-label and aria-describedby win over the Field wiring', () => {
      renderInField({ 'aria-label': 'Departure', 'aria-describedby': 'custom-hint' })
      const group = screen.getByRole('group', { name: 'Departure' })
      expect(group).not.toHaveAttribute('aria-labelledby')
      expect(group).toHaveAttribute('aria-describedby', 'custom-hint')
    })

    it('lets a consumer aria-invalid win on the group and segments', () => {
      renderInField({ 'aria-invalid': false }, true)
      expect(screen.getByRole('group', { name: 'Start time' })).toHaveAttribute('aria-invalid', 'false')
      for (const segment of screen.getAllByRole('spinbutton')) {
        expect(segment).toHaveAttribute('aria-invalid', 'false')
      }
    })

    it('has no accessibility violations when labeled, described and invalid', async () => {
      const { container } = renderInField({}, true)
      expect(await axe(container)).toHaveNoViolations()
    })
  })

  it('renders startSlot and endSlot containers', () => {
    const { container } = render(
      <TimeField
        defaultValue="09:30"
        startSlot={<span data-testid="s">s</span>}
        endSlot={<span data-testid="e">e</span>}
      />,
    )
    expect(container.querySelector('[data-slot="time-field-start"]')).toContainElement(screen.getByTestId('s'))
    expect(container.querySelector('[data-slot="time-field-end"]')).toContainElement(screen.getByTestId('e'))
  })

  it('keeps segments reachable as a single aria group', () => {
    render(<TimeField defaultValue="09:30" format="hh:mm a" />)
    expect(getSegments('hour')).toHaveLength(1)
    expect(getSegments('period')).toHaveLength(1)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <label id="t-label">Time</label>
        <TimeField defaultValue="09:30" aria-labelledby="t-label" />
      </>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
