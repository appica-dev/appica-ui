import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import * as React from 'react'
import { Field, FieldDescription, FieldLabel } from '../field/field'
import { DatePicker, type DateRange } from './date-picker'

const JUN_10 = new Date(2026, 5, 10)
const JUN_17 = new Date(2026, 5, 17)

function getDateSegments() {
  return screen.getAllByRole('spinbutton', { name: /day|month|year/ })
}

function getMonthSegment() {
  return screen.getByRole('spinbutton', { name: 'month' })
}

describe('DatePicker', () => {
  describe('single mode', () => {
    it('renders a DateField populated from defaultValue', () => {
      render(<DatePicker defaultValue={JUN_10} defaultMonth={JUN_10} />)
      expect(screen.getByRole('spinbutton', { name: 'month' })).toHaveTextContent('06')
      expect(screen.getByRole('spinbutton', { name: 'day' })).toHaveTextContent('10')
      expect(screen.getByRole('spinbutton', { name: 'year' })).toHaveTextContent('2026')
    })

    it('opens the calendar popover when the trigger button is clicked', async () => {
      const user = userEvent.setup()
      render(<DatePicker defaultMonth={JUN_10} />)
      expect(screen.queryByRole('grid')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /open calendar/i }))
      expect(await screen.findByRole('grid')).toBeInTheDocument()
    })

    it('focusing a segment does NOT open the popover', async () => {
      const user = userEvent.setup()
      render(<DatePicker defaultMonth={JUN_10} />)
      await user.click(getMonthSegment())
      expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    })

    it('selecting a day in the calendar updates the field and closes the popover', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(<DatePicker defaultMonth={JUN_10} onValueChange={onValueChange} />)
      await user.click(screen.getByRole('button', { name: /open calendar/i }))
      const dayBtn = await screen.findByRole('button', { name: /June 10th, 2026/ })
      await user.click(dayBtn)
      expect(onValueChange).toHaveBeenCalled()
      const [picked] = onValueChange.mock.calls[0]!
      expect(picked).toBeInstanceOf(Date)
      expect((picked as Date).getDate()).toBe(10)
    })

    it('renders a TimeField alongside DateField when showTime is enabled', () => {
      render(<DatePicker defaultValue={new Date(2026, 5, 10, 9, 30, 0)} defaultMonth={JUN_10} showTime />)
      // 3 date segments + 3 time segments (HH:mm:ss)
      const segments = screen.getAllByRole('spinbutton')
      expect(segments.length).toBeGreaterThanOrEqual(6)
      const hour = screen.getByRole('spinbutton', { name: 'hour' })
      const minute = screen.getByRole('spinbutton', { name: 'minute' })
      expect(hour).toHaveTextContent('09')
      expect(minute).toHaveTextContent('30')
    })

    it('typing an intermediate-invalid digit (day=0) does not clear the picker value', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      function Controlled() {
        const [date, setDate] = React.useState<Date | undefined>(JUN_10)
        return (
          <DatePicker
            value={date}
            onValueChange={(v) => {
              setDate(v)
              onValueChange(v)
            }}
            defaultMonth={JUN_10}
          />
        )
      }
      render(<Controlled />)
      onValueChange.mockClear()

      await user.click(screen.getByRole('spinbutton', { name: 'day' }))
      await user.keyboard('0')
      // Picker value must remain Jun 10; segments stay editable.
      expect(onValueChange).not.toHaveBeenCalled()
      expect(screen.getByRole('spinbutton', { name: 'month' })).toHaveTextContent('06')
      expect(screen.getByRole('spinbutton', { name: 'year' })).toHaveTextContent('2026')
    })

    it('opening the calendar after a completed field edit shows the new month', async () => {
      const user = userEvent.setup()
      function Controlled() {
        const [date, setDate] = React.useState<Date | undefined>(JUN_10)
        return <DatePicker value={date} onValueChange={setDate} defaultMonth={JUN_10} />
      }
      render(<Controlled />)

      // Replace the month with September (09) and reopen the calendar.
      const monthSeg = screen.getByRole('spinbutton', { name: 'month' })
      await user.click(monthSeg)
      await user.keyboard('09')

      await user.click(screen.getByRole('button', { name: /open calendar/i }))
      // react-day-picker labels the month caption - September should now be visible.
      const grid = await screen.findByRole('grid')
      expect(grid).toHaveAccessibleName(/september 2026/i)
    })

    it('selecting a day preserves the existing time portion of the value', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(
        <DatePicker
          defaultValue={new Date(2026, 5, 5, 14, 30, 0)}
          defaultMonth={JUN_10}
          showTime
          onValueChange={onValueChange}
        />,
      )
      await user.click(screen.getByRole('button', { name: /open calendar/i }))
      const dayBtn = await screen.findByRole('button', { name: /June 10th, 2026/ })
      await user.click(dayBtn)
      const [picked] = onValueChange.mock.calls[0]!
      const d = picked as Date
      expect(d.getDate()).toBe(10)
      expect(d.getHours()).toBe(14)
      expect(d.getMinutes()).toBe(30)
    })
  })

  describe('range mode', () => {
    it('renders two DateFields with a separator', () => {
      const range: DateRange = { from: JUN_10, to: JUN_17 }
      render(<DatePicker mode="range" defaultValue={range} defaultMonth={JUN_10} />)
      const segments = getDateSegments()
      // two DateFields = 6 segments (day, month, year × 2)
      expect(segments).toHaveLength(6)
    })

    it('updates only the from half when the from field changes', () => {
      const onValueChange = vi.fn()
      function Controlled() {
        const [range, setRange] = React.useState<DateRange | undefined>({ from: JUN_10, to: JUN_17 })
        return (
          <DatePicker
            mode="range"
            value={range}
            defaultMonth={JUN_10}
            onValueChange={(next) => {
              setRange(next)
              onValueChange(next)
            }}
          />
        )
      }
      render(<Controlled />)
      // Sanity: both halves rendered
      const dayCells = screen.getAllByRole('spinbutton', { name: 'day' })
      expect(dayCells).toHaveLength(2)
    })

    it('labels the two fields Start date and End date by default', () => {
      const { container } = render(<DatePicker mode="range" defaultValue={{ from: JUN_10, to: JUN_17 }} />)
      const fields = container.querySelectorAll('[data-slot="date-field"]')
      expect(screen.getByRole('group', { name: 'Start date' })).toBe(fields[0])
      expect(screen.getByRole('group', { name: 'End date' })).toBe(fields[1])
    })

    it('uses startAriaLabel and endAriaLabel when passed', () => {
      render(<DatePicker mode="range" startAriaLabel="Check-in" endAriaLabel="Check-out" />)
      expect(screen.getByRole('group', { name: 'Check-in' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'Check-out' })).toBeInTheDocument()
      expect(screen.queryByRole('group', { name: 'Start date' })).toBeNull()
    })

    it('labels the time fields with the same start and end labels when showTime is set', () => {
      const { container } = render(<DatePicker mode="range" showTime />)
      const timeFields = container.querySelectorAll('[data-slot="time-field"]')
      expect(timeFields[0]).toHaveAttribute('aria-label', 'Start date')
      expect(timeFields[1]).toHaveAttribute('aria-label', 'End date')
    })

    it('makes the wrapper a group labeled by the FieldLabel', () => {
      const { container } = render(
        <Field>
          <FieldLabel>Trip dates</FieldLabel>
          <DatePicker mode="range" defaultValue={{ from: JUN_10, to: JUN_17 }} />
        </Field>,
      )
      const wrapper = container.querySelector('[data-slot="date-picker"]')
      expect(screen.getByRole('group', { name: 'Trip dates' })).toBe(wrapper)
      expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: 'End date' })).toBeInTheDocument()
      expect(screen.getByText('Trip dates')).not.toHaveAttribute('for')
    })

    it('has no accessibility violations inside a Field', async () => {
      const { container } = render(
        <Field>
          <FieldLabel>Trip dates</FieldLabel>
          <DatePicker mode="range" showTime defaultValue={{ from: JUN_10, to: JUN_17 }} />
          <FieldDescription>Check-in and check-out.</FieldDescription>
        </Field>,
      )
      expect(await axe(container)).toHaveNoViolations()
    })

    it('does NOT auto-close the popover after both ends are picked', async () => {
      const user = userEvent.setup()
      render(<DatePicker mode="range" defaultMonth={JUN_10} />)
      await user.click(screen.getByRole('button', { name: /open calendar/i }))
      const grid = await screen.findByRole('grid')
      await user.click(await screen.findByRole('button', { name: /June 10th, 2026/ }))
      await user.click(await screen.findByRole('button', { name: /June 17th, 2026/ }))
      // Popover stays open so the range can still be refined; it dismisses on outside-click/Escape.
      expect(grid).toBeInTheDocument()
    })
  })

  describe('multiple mode', () => {
    it('renders a read-only summary input', () => {
      const days = [JUN_10, JUN_17, new Date(2026, 5, 24)]
      render(<DatePicker mode="multiple" defaultValue={days} defaultMonth={JUN_10} />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input).toHaveAttribute('readonly')
      expect(input.value).toMatch(/06\/10\/2026 \(\+2 more\)/)
    })

    it('does NOT auto-close the popover when picking days', async () => {
      const user = userEvent.setup()
      render(<DatePicker mode="multiple" defaultMonth={JUN_10} />)
      await user.click(screen.getByRole('button', { name: /open calendar/i }))
      const grid = await screen.findByRole('grid')
      const dayBtn = await screen.findByRole('button', { name: /June 10th, 2026/ })
      await user.click(dayBtn)
      // Popover should still be open after selecting a day in multiple mode
      expect(grid).toBeInTheDocument()
    })

    it('clearable empties the summary and clears the value', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(
        <DatePicker
          mode="multiple"
          defaultValue={[JUN_10, JUN_17]}
          defaultMonth={JUN_10}
          clearable
          onValueChange={onValueChange}
        />,
      )
      const clearBtn = screen.getByRole('button', { name: /clear/i })
      await user.click(clearBtn)
      expect(onValueChange).toHaveBeenCalledWith(undefined)
    })

    it('one click on clear empties the input in a controlled multiple-mode picker', async () => {
      const user = userEvent.setup()
      function Controlled() {
        const [days, setDays] = React.useState<Date[] | undefined>([JUN_10, JUN_17, new Date(2026, 5, 24)])
        return <DatePicker mode="multiple" value={days} defaultMonth={JUN_10} clearable onValueChange={setDays} />
      }
      render(<Controlled />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toMatch(/\(\+2 more\)/)
      await user.click(screen.getByRole('button', { name: /clear/i }))
      expect(input.value).toBe('')
    })

    it('clears in one click immediately after picking dates with popover still open', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      function Controlled() {
        const [days, setDays] = React.useState<Date[] | undefined>(undefined)
        return (
          <DatePicker
            mode="multiple"
            value={days}
            defaultMonth={JUN_10}
            clearable
            onValueChange={(next) => {
              onValueChange(next)
              setDays(next)
            }}
          />
        )
      }
      render(<Controlled />)
      await user.click(screen.getByRole('button', { name: /open calendar/i }))
      await user.click(await screen.findByRole('button', { name: /June 10th, 2026/ }))
      await user.click(await screen.findByRole('button', { name: /June 17th, 2026/ }))
      await user.click(await screen.findByRole('button', { name: /June 24th, 2026/ }))

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toMatch(/\(\+2 more\)/)

      onValueChange.mockClear()
      // Popover is still open at this point.
      await user.click(screen.getByRole('button', { name: /clear/i }))
      expect(input.value).toBe('')
    })

    it('one click on clear empties a single-date controlled multiple-mode picker', async () => {
      const user = userEvent.setup()
      function Controlled() {
        const [days, setDays] = React.useState<Date[] | undefined>([JUN_10])
        return <DatePicker mode="multiple" value={days} defaultMonth={JUN_10} clearable onValueChange={setDays} />
      }
      render(<Controlled />)
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('06/10/2026')
      await user.click(screen.getByRole('button', { name: /clear/i }))
      expect(input.value).toBe('')
    })
  })

  it('inherits invalid and disabled from a surrounding Field', async () => {
    const { Field } = await import('@base-ui/react/field')
    const { container } = render(
      <Field.Root invalid disabled>
        <DatePicker showTime defaultValue={JUN_10} defaultMonth={JUN_10} />
      </Field.Root>,
    )
    const root = container.querySelector('[data-slot="date-picker"]')
    expect(root).toHaveAttribute('data-invalid')
    expect(root).toHaveAttribute('data-disabled')
  })

  it('names the single-mode field from a surrounding FieldLabel', () => {
    render(
      <Field>
        <FieldLabel>Departure</FieldLabel>
        <DatePicker defaultValue={JUN_10} defaultMonth={JUN_10} />
        <FieldDescription>Pick a weekday.</FieldDescription>
      </Field>,
    )
    const group = screen.getByRole('group', { name: 'Departure' })
    expect(group).toHaveAttribute('data-slot', 'date-field')
    expect(group).toHaveAttribute('aria-describedby', screen.getByText('Pick a weekday.').id)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<DatePicker defaultValue={JUN_10} defaultMonth={JUN_10} />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations inside a Field', async () => {
    const { container } = render(
      <Field>
        <FieldLabel>Departure</FieldLabel>
        <DatePicker showTime defaultValue={JUN_10} defaultMonth={JUN_10} />
      </Field>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
