import { render, screen } from '@testing-library/svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import CountdownPartsHost from './countdown-parts.test-host.svelte'
import CountdownHost from './countdown.test-host.svelte'
import CountdownSegment from './countdown-segment.svelte'

const BASE = new Date('2026-06-19T00:00:00.000Z').getTime()
const SECOND = 1000

function offset({ d = 0, h = 0, m = 0, s = 0 }) {
  return ((d * 24 + h) * 60 + m) * 60 * SECOND + s * SECOND
}

afterEach(() => {
  vi.useRealTimers()
})

describe('Countdown', () => {
  it('breaks a future targetDate into day/hour/minute/second segments', () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE)
    render(CountdownHost, {
      props: { targetDate: BASE + offset({ d: 2, h: 5, m: 10, s: 30 }) },
    })

    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('05')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('counts down as time passes', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE)
    render(CountdownHost, {
      props: { targetDate: BASE + offset({ d: 2, h: 5, m: 10, s: 30 }), units: ['seconds'] },
    })

    expect(screen.getByText('30')).toBeInTheDocument()
    await vi.advanceTimersByTimeAsync(SECOND)
    expect(screen.getByText('29')).toBeInTheDocument()
  })

  it('fires onComplete once when it reaches zero', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE)
    const onComplete = vi.fn()
    render(CountdownHost, {
      props: { duration: 3, onComplete, units: ['seconds'] },
    })

    expect(onComplete).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(3 * SECOND)
    expect(onComplete).toHaveBeenCalledOnce()

    await vi.advanceTimersByTimeAsync(5 * SECOND)
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('exposes a timer role', () => {
    render(CountdownHost, {
      props: { duration: 60, ariaLabel: 'Sale ends in', units: ['minutes'] },
    })
    expect(screen.getByRole('timer', { name: 'Sale ends in' })).toBeInTheDocument()
  })

  it('forwards class to the root', () => {
    render(CountdownHost, {
      props: { duration: 60, class: 'custom-class', ariaLabel: 'Timer', units: ['seconds'] },
    })
    expect(screen.getByRole('timer').className).toContain('custom-class')
  })

  it('passes the parts to a children snippet', () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE)
    render(CountdownPartsHost, { props: { duration: 5 } })
    expect(screen.getByText('5s left')).toBeInTheDocument()
  })
})

describe('CountdownSegment', () => {
  it('renders a standalone value without a Countdown parent', () => {
    render(CountdownSegment, { props: { value: 7, 'aria-label': 'Items' } })
    expect(screen.getByText('07')).toBeInTheDocument()
  })

  it('zero-pads to minDigits', () => {
    render(CountdownSegment, { props: { value: 5, minDigits: 3 } })
    expect(screen.getByText('005')).toBeInTheDocument()
  })

  it('keeps digits in left-to-right order regardless of layout direction', () => {
    const { container } = render(CountdownSegment, { props: { value: 195 } })
    expect(container.querySelector('[data-slot="countdown-segment"] [aria-hidden="true"]')).toHaveAttribute(
      'dir',
      'ltr',
    )
  })

  it('has no accessibility violations', async () => {
    const { container } = render(CountdownHost, {
      props: { duration: 3600, ariaLabel: 'Offer ends in', units: ['hours', 'minutes', 'seconds'] },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
