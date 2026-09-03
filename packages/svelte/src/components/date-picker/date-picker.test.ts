import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { CalendarDate } from '@internationalized/date'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import DatePickerHost from './date-picker.test-host.svelte'
import type { DateRange } from '../calendar/calendar-tokens'

const overlay = { hidden: true as const }

beforeAll(() => {
  const style = document.createElement('style')
  style.dataset.datePickerTest = ''
  style.textContent =
    '[data-bits-floating-content-wrapper] { visibility: visible !important; transform: none !important; }'
  document.head.append(style)
})

afterAll(() => {
  document.querySelector('[data-date-picker-test]')?.remove()
})

const JUN_10 = new CalendarDate(2026, 6, 10)
const JUN_17 = new CalendarDate(2026, 6, 17)

describe('DatePicker', () => {
  describe('single', () => {
    it('renders a DateField populated from defaultValue', () => {
      render(DatePickerHost, { props: { defaultValue: JUN_10 } })
      expect(screen.getByRole('spinbutton', { name: /month/i })).toHaveTextContent('6')
      expect(screen.getByRole('spinbutton', { name: /day/i })).toHaveTextContent('10')
      expect(screen.getByRole('spinbutton', { name: /year/i })).toHaveTextContent('2026')
    })

    it('opens the calendar popover when the trigger is clicked', async () => {
      const user = userEvent.setup()
      render(DatePickerHost)
      expect(screen.queryByRole('grid', overlay)).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /open calendar/i }))
      expect(await screen.findByRole('grid', overlay)).toBeInTheDocument()
    })

    it('selecting a day updates the value and closes the popover', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(DatePickerHost, { props: { onValueChange } })
      await user.click(screen.getByRole('button', { name: /open calendar/i }))
      await user.click(await screen.findByRole('button', { name: /June 10, 2026/, ...overlay }))
      expect(onValueChange).toHaveBeenCalled()
      const [picked] = onValueChange.mock.calls[0]!
      expect(picked).toBeInstanceOf(CalendarDate)
      expect((picked as CalendarDate).day).toBe(10)
      await waitFor(() => {
        expect(screen.queryByRole('grid')).not.toBeInTheDocument()
      })
    })

    it('renders a TimeField when showTime is enabled', () => {
      render(DatePickerHost, { props: { defaultValue: JUN_10, showTime: true, hourCycle: 24 } })
      expect(screen.getAllByRole('spinbutton').length).toBeGreaterThanOrEqual(5)
      expect(screen.getByRole('spinbutton', { name: /hour/i })).toBeInTheDocument()
      expect(screen.getByRole('spinbutton', { name: /minute/i })).toBeInTheDocument()
    })
  })

  describe('range', () => {
    it('renders two DateFields with a separator', () => {
      const range: DateRange = { from: JUN_10, to: JUN_17 }
      render(DatePickerHost, { props: { type: 'range', defaultValue: range } })
      expect(screen.getAllByRole('spinbutton', { name: /day/i })).toHaveLength(2)
    })

    it('does not auto-close after both ends are picked', async () => {
      const user = userEvent.setup()
      render(DatePickerHost, { props: { type: 'range' } })
      await user.click(screen.getByRole('button', { name: /open calendar/i }))
      const grid = await screen.findByRole('grid', overlay)
      await user.click(await screen.findByRole('button', { name: /June 10, 2026/, ...overlay }))
      await user.click(await screen.findByRole('button', { name: /June 17, 2026/, ...overlay }))
      expect(grid).toBeInTheDocument()
    })
  })

  describe('multiple', () => {
    it('renders a read-only summary input', () => {
      render(DatePickerHost, {
        props: { type: 'multiple', defaultValue: [JUN_10, JUN_17, new CalendarDate(2026, 6, 24)] },
      })
      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input).toHaveAttribute('readonly')
      expect(input.value).toBe('2026-06-10 (+2 more)')
    })

    it('does not auto-close when picking days', async () => {
      const user = userEvent.setup()
      render(DatePickerHost, { props: { type: 'multiple' } })
      await user.click(screen.getByRole('button', { name: /open calendar/i }))
      const grid = await screen.findByRole('grid', overlay)
      await user.click(await screen.findByRole('button', { name: /June 10, 2026/, ...overlay }))
      expect(grid).toBeInTheDocument()
    })
  })

  it('marks the control invalid inside Field', () => {
    const { container } = render(DatePickerHost, { props: { invalid: true, showTime: true } })
    expect(container.querySelector('[data-slot="date-picker"]')).toHaveAttribute('data-invalid')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(DatePickerHost, { props: { defaultValue: JUN_10 } })
    const results = await axe(container)
    expect(results.violations.map((v) => v.id)).toEqual([])
  }, 15_000)
})
