import { render, screen } from '@testing-library/svelte'
import { Time } from '@internationalized/date'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import TimeFieldHost from './time-field.test-host.svelte'

const NINE_THIRTY = new Time(9, 30)

describe('TimeField', () => {
  it('renders hour and minute segments by default', () => {
    render(TimeFieldHost, { props: { defaultValue: NINE_THIRTY, hourCycle: 24 } })
    expect(screen.getByRole('spinbutton', { name: /hour/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /minute/i })).toBeInTheDocument()
  })

  it('populates segments from defaultValue', () => {
    render(TimeFieldHost, { props: { defaultValue: NINE_THIRTY, hourCycle: 24 } })
    expect(screen.getByRole('spinbutton', { name: /hour/i })).toHaveTextContent('09')
    expect(screen.getByRole('spinbutton', { name: /minute/i })).toHaveTextContent('30')
  })

  it('renders a day period segment in 12-hour mode', () => {
    render(TimeFieldHost, { props: { defaultValue: NINE_THIRTY, hourCycle: 12 } })
    expect(screen.getByRole('spinbutton', { name: /am\/pm/i })).toBeInTheDocument()
  })

  it('renders a seconds segment when granularity is second', () => {
    render(TimeFieldHost, {
      props: { defaultValue: new Time(9, 30, 45), hourCycle: 24, granularity: 'second' },
    })
    expect(screen.getByRole('spinbutton', { name: /second/i })).toBeInTheDocument()
  })

  it('renders a hidden input when name is set', () => {
    const { container } = render(TimeFieldHost, {
      props: { defaultValue: NINE_THIRTY, name: 'start', hourCycle: 24 },
    })
    expect(container.querySelector('input[name="start"]')).not.toBeNull()
  })

  it('marks the field invalid inside Field', () => {
    const { container } = render(TimeFieldHost, { props: { invalid: true } })
    expect(container.querySelector('[data-slot="time-field"]')).toHaveAttribute('data-invalid')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(TimeFieldHost, { props: { defaultValue: NINE_THIRTY, hourCycle: 24 } })
    const results = await axe(container)
    expect(results.violations.map((v) => v.id)).toEqual([])
  }, 15_000)
})
