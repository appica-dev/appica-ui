import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { CalendarDate } from '@internationalized/date'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import CalendarHost from './calendar.test-host.svelte'

const MAY_15 = new CalendarDate(2026, 5, 15)

describe('Calendar', () => {
  it('renders a grid with day buttons for the given month', () => {
    render(CalendarHost)
    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /May 15, 2026/ })).toBeInTheDocument()
  })

  it('selects a date when a day is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(CalendarHost, { props: { onSelect } })
    await user.click(screen.getByRole('button', { name: /May 20, 2026/ }))
    expect(onSelect).toHaveBeenCalled()
    const [selected] = onSelect.mock.calls[0]!
    expect(selected).toBeInstanceOf(CalendarDate)
    expect((selected as CalendarDate).day).toBe(20)
  })

  it('reflects the controlled selected date with aria-selected', () => {
    render(CalendarHost, { props: { selected: MAY_15 } })
    const cell = screen.getByRole('gridcell', { selected: true })
    expect(cell).toHaveAttribute('data-value', '2026-05-15')
  })

  it('applies size variant via --cell-size CSS variable on the root', () => {
    const { rerender } = render(CalendarHost, { props: { size: 'sm' } })
    expect(document.querySelector('[data-slot="calendar"]')?.className).toContain('--cell-size:--spacing(6)')

    rerender({ size: 'lg' })
    expect(document.querySelector('[data-slot="calendar"]')?.className).toContain('--cell-size:--spacing(10)')
  })

  it('renders prev/next navigation buttons that change months', async () => {
    const user = userEvent.setup()
    render(CalendarHost)
    expect(screen.getByRole('button', { name: /May 15, 2026/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /next month/i }))
    expect(screen.getByRole('button', { name: /June 15, 2026/ })).toBeInTheDocument()
  })

  it('renders month and year dropdowns by default', () => {
    render(CalendarHost)
    expect(screen.getByRole('combobox', { name: /month/i })).toHaveTextContent(/may/i)
    expect(screen.getByRole('combobox', { name: /year/i })).toHaveTextContent('2026')
  })

  it('swaps dropdowns for a static label when captionLayout is label', () => {
    render(CalendarHost, { props: { captionLayout: 'label' } })
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(document.querySelector('[data-calendar-heading]')).toHaveTextContent('May 2026')
  })

  it('renders multiple month grids when numberOfMonths is set', () => {
    render(CalendarHost, { props: { numberOfMonths: 2 } })
    expect(screen.getAllByRole('grid')).toHaveLength(2)
  })

  it('does not render adjacent-month days when showOutsideDays is false', () => {
    render(CalendarHost, { props: { showOutsideDays: false } })
    expect(screen.queryByRole('button', { name: /April 27, 2026/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /May 1, 2026/ })).toBeInTheDocument()
  })

  it('does not clear the selected day when required is set', async () => {
    const user = userEvent.setup()
    render(CalendarHost, { props: { defaultSelected: MAY_15, required: true } })
    await user.click(screen.getByRole('button', { name: /May 15, 2026/ }))
    expect(screen.getByRole('gridcell', { selected: true })).toHaveAttribute('data-value', '2026-05-15')
  })

  it('blocks disabled dates from being selected', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(CalendarHost, {
      props: {
        onSelect,
        disabled: { dayOfWeek: [0, 6] },
      },
    })
    await user.click(screen.getByRole('button', { name: /May 16, 2026/ }))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('selects a range when mode is range', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(CalendarHost, { props: { mode: 'range', onSelect } })

    await user.click(screen.getByRole('button', { name: /May 10, 2026/ }))
    await user.click(screen.getByRole('button', { name: /May 20, 2026/ }))

    expect(onSelect).toHaveBeenCalled()
    const last = onSelect.mock.calls.at(-1)![0] as { from?: CalendarDate; to?: CalendarDate }
    expect(last.from?.day).toBe(10)
    expect(last.to?.day).toBe(20)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(CalendarHost)
    const results = await axe(container)
    expect(results.violations.map((v) => v.id)).toEqual([])
  }, 15_000)
})
