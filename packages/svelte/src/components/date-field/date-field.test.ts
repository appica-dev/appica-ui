import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { CalendarDate, CalendarDateTime } from '@internationalized/date'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { htmlSnippet } from '../../test/snippet'
import DateFieldHost from './date-field.test-host.svelte'
import DateFieldControlledHost from './date-field.controlled-host.svelte'
import DateField from './date-field.svelte'

const JUN_23 = new CalendarDate(2026, 6, 23)

describe('DateField', () => {
  it('renders month, day, and year segments', () => {
    render(DateFieldHost, { props: { defaultValue: JUN_23 } })
    expect(screen.getByRole('spinbutton', { name: /month/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /day/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /year/i })).toBeInTheDocument()
  })

  it('populates segments from defaultValue', () => {
    render(DateFieldHost, { props: { defaultValue: JUN_23 } })
    expect(screen.getByRole('spinbutton', { name: /month/i })).toHaveTextContent('6')
    expect(screen.getByRole('spinbutton', { name: /day/i })).toHaveTextContent('23')
    expect(screen.getByRole('spinbutton', { name: /year/i })).toHaveTextContent('2026')
  })

  it('renders a hidden input when name is set', () => {
    const { container } = render(DateFieldHost, { props: { defaultValue: JUN_23, name: 'dob' } })
    const hidden = container.querySelector('input[name="dob"]') as HTMLInputElement
    expect(hidden).not.toBeNull()
    expect(hidden.value).toBe('2026-06-23')
  })

  it('disables interaction when disabled', () => {
    render(DateFieldHost, { props: { disabled: true, defaultValue: JUN_23 } })
    expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true')
  })

  it('applies size classes to the root', () => {
    const { container } = render(DateFieldHost, { props: { size: 'lg' } })
    expect(container.querySelector('[data-slot="date-field"]')?.className).toContain('h-12')
  })

  it('drops the field chrome when unstyled', () => {
    const { container } = render(DateFieldHost, { props: { unstyled: true } })
    const root = container.querySelector('[data-slot="date-field"]')
    expect(root?.className).not.toContain('border')
  })

  it('marks the field invalid inside Field', () => {
    const { container } = render(DateFieldHost, { props: { invalid: true } })
    expect(container.querySelector('[data-slot="date-field"]')).toHaveAttribute('data-invalid')
  })

  it('bridges aria-invalid to data-invalid', () => {
    const { container } = render(DateField, {
      props: { defaultValue: JUN_23, 'aria-invalid': true, 'aria-label': 'Date' },
    })
    expect(container.querySelector('[data-slot="date-field"]')).toHaveAttribute('data-invalid')
  })

  it('keeps segments focusable when readonly', () => {
    render(DateFieldHost, { props: { readonly: true, defaultValue: JUN_23 } })
    expect(screen.getByRole('group')).not.toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('spinbutton', { name: /month/i })).not.toHaveAttribute('tabindex', '-1')
  })

  it('renders start and end snippets', () => {
    const { container } = render(DateField, {
      props: {
        defaultValue: JUN_23,
        'aria-label': 'Date',
        start: htmlSnippet('<span data-testid="s">s</span>'),
        end: htmlSnippet('<span data-testid="e">e</span>'),
      },
    })
    expect(container.querySelector('[data-slot="date-field-start"]')).toContainElement(screen.getByTestId('s'))
    expect(container.querySelector('[data-slot="date-field-end"]')).toContainElement(screen.getByTestId('e'))
  })

  it('applies parent-driven controlled updates', async () => {
    const user = userEvent.setup()
    render(DateFieldControlledHost)
    expect(screen.getByTestId('date-value')).toHaveTextContent('2026-06-23')

    await user.click(screen.getByRole('button', { name: 'Set January 5' }))
    expect(screen.getByRole('spinbutton', { name: /month/i })).toHaveTextContent('1')
    expect(screen.getByRole('spinbutton', { name: /day/i })).toHaveTextContent('5')
    expect(screen.getByRole('spinbutton', { name: /year/i })).toHaveTextContent('2030')
    expect(screen.getByTestId('date-value')).toHaveTextContent('2030-01-05')
  })

  it('commits user edits in controlled mode', async () => {
    const user = userEvent.setup()
    render(DateFieldControlledHost)
    const day = screen.getByRole('spinbutton', { name: /day/i })
    await user.click(day)
    await user.keyboard('{ArrowUp}')
    expect(day).toHaveTextContent('24')
    expect(screen.getByTestId('date-value')).toHaveTextContent('2026-06-24')
  })

  it('orders segments by locale', () => {
    render(DateFieldHost, { props: { defaultValue: JUN_23, locale: 'de-DE' } })
    const segs = screen.getAllByRole('spinbutton')
    expect(segs[0]).toHaveAccessibleName(/day/i)
    expect(segs[1]).toHaveAccessibleName(/month/i)
    expect(segs[2]).toHaveAccessibleName(/year/i)
  })

  it('infers time segments from a CalendarDateTime value', () => {
    render(DateField, {
      props: {
        defaultValue: new CalendarDateTime(2026, 6, 23, 14, 30),
        hourCycle: 24,
        'aria-label': 'Date',
      },
    })
    expect(screen.getByRole('spinbutton', { name: /hour/i })).toHaveTextContent('14')
    expect(screen.getByRole('spinbutton', { name: /minute/i })).toHaveTextContent('30')
  })

  it('uses placeholder to determine empty-field format', () => {
    render(DateField, {
      props: {
        placeholder: new CalendarDateTime(2026, 6, 23, 14, 30),
        hourCycle: 24,
        'aria-label': 'Date',
      },
    })
    expect(screen.getByRole('spinbutton', { name: /hour/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /minute/i })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(DateFieldHost, { props: { defaultValue: JUN_23 } })
    const results = await axe(container)
    expect(results.violations.map((v) => v.id)).toEqual([])
  }, 15_000)
})
