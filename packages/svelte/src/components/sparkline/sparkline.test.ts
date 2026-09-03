import { render, screen } from '@testing-library/svelte'
import { tick } from 'svelte'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import SparklineHost from './sparkline.test-host.svelte'

const DATA = [4, 8, 6, 10, 7, 12]
const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** jsdom returns a 0x0 rect; give the chart a real width so pointer mapping runs. */
function stubRect(el: Element, width = 100) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: width,
    bottom: 48,
    width,
    height: 48,
    toJSON: () => ({}),
  } as DOMRect)
}

function dispatchPointer(el: Element, type: string, init: PointerEventInit = {}) {
  el.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  )
}

describe('Sparkline', () => {
  it('renders a line path for the line variant', () => {
    const { container } = render(SparklineHost, { props: { data: DATA, variant: 'line' } })
    expect(container.querySelector('[data-slot=sparkline-line]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot=sparkline-area]')).not.toBeInTheDocument()
  })

  it('renders a baseline-anchored fill for the area variant', () => {
    const { container } = render(SparklineHost, { props: { data: DATA, variant: 'area' } })
    expect(container.querySelector('[data-slot=sparkline-fill]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot=sparkline-baseline]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot=sparkline-line]')).toBeInTheDocument()
  })

  it('line variant is stroke-only by default, gaining a gradient fill only when `fill` is set', async () => {
    const { container, rerender } = render(SparklineHost, { props: { data: DATA, variant: 'line' } })
    expect(container.querySelector('[data-slot=sparkline-fill]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot=sparkline-baseline]')).not.toBeInTheDocument()

    await rerender({ data: DATA, variant: 'line', fill: true })
    expect(container.querySelector('[data-slot=sparkline-fill]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot=sparkline-baseline]')).not.toBeInTheDocument()
  })

  it('renders one column per data point plus a baseline for the column variant', () => {
    const { container } = render(SparklineHost, { props: { data: DATA, variant: 'column' } })
    expect(container.querySelectorAll('[data-slot=sparkline-column]')).toHaveLength(DATA.length)
    expect(container.querySelector('[data-slot=sparkline-baseline]')).toBeInTheDocument()
  })

  it('column highlight is gated on `indicator`, independent of the tooltip', async () => {
    const { container } = render(SparklineHost, {
      props: { data: DATA, variant: 'column', indicator: false, tooltip: true },
    })
    const chart = screen.getByRole('img')
    stubRect(chart, 100)
    dispatchPointer(chart, 'pointermove', { clientX: 50 })
    await tick()
    expect(container.querySelector('[data-slot=sparkline-tooltip]')).toBeInTheDocument()
    expect(container.querySelector('[data-active]')).not.toBeInTheDocument()
  })

  it('columns pivot on the baseline: positive bars round the top, negatives round the bottom', () => {
    const { container } = render(SparklineHost, { props: { data: [6, -4], variant: 'column' } })
    const bars = container.querySelectorAll('[data-slot=sparkline-column]')
    expect(bars[0]!.className).toContain('rounded-t-')
    expect(bars[1]!.className).toContain('rounded-b-')
  })

  it('sets the accent color as a CSS variable on the root', () => {
    render(SparklineHost, { props: { data: DATA, color: 'var(--color-success)', testId: 'root' } })
    expect(screen.getByTestId('root').style.getPropertyValue('--sparkline-color')).toBe('var(--color-success)')
  })

  it('SparklineValue shows the last value by default, formatted', () => {
    render(SparklineHost, {
      props: {
        data: DATA,
        format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
        showValue: true,
      },
    })
    expect(screen.getByText('$12')).toBeInTheDocument()
  })

  it('SparklineLabel renders nothing without labels and the last label with them', async () => {
    const { rerender } = render(SparklineHost, { props: { data: DATA, showLabel: true } })
    expect(screen.queryByTestId('label')).not.toBeInTheDocument()

    await rerender({ data: DATA, labels: LABELS, showLabel: true })
    expect(screen.getByTestId('label')).toHaveTextContent('Sat')
  })

  it('does not render the tooltip until hovered', () => {
    const { container } = render(SparklineHost, { props: { data: DATA, labels: LABELS, tooltip: true } })
    expect(container.querySelector('[data-slot=sparkline-tooltip]')).not.toBeInTheDocument()
  })

  it('activates the nearest point on hover: updates value, tooltip, and onActiveChange', async () => {
    const onActiveChange = vi.fn()
    const { container } = render(SparklineHost, {
      props: { data: DATA, labels: LABELS, onActiveChange, showValue: true, tooltip: true },
    })
    expect(onActiveChange).not.toHaveBeenCalled()

    const chart = screen.getByRole('img')
    stubRect(chart, 100)

    dispatchPointer(chart, 'pointermove', { clientX: 0 })
    await tick()
    expect(onActiveChange).toHaveBeenLastCalledWith({ index: 0, value: 4, label: 'Mon' })
    expect(container.querySelector('[data-slot=sparkline-value]')).toHaveTextContent('4')
    expect(container.querySelector('[data-slot=sparkline-tooltip]')).toHaveTextContent('Mon')

    dispatchPointer(chart, 'pointermove', { clientX: 100 })
    await tick()
    expect(onActiveChange).toHaveBeenLastCalledWith({ index: 5, value: 12, label: 'Sat' })

    dispatchPointer(chart, 'pointerleave')
    await tick()
    expect(onActiveChange).toHaveBeenLastCalledWith(null)
  })

  it('activates on a stationary touch tap and clears when the finger lifts', async () => {
    const onActiveChange = vi.fn()
    render(SparklineHost, { props: { data: DATA, onActiveChange, tooltip: true } })
    const chart = screen.getByRole('img')
    stubRect(chart, 100)

    dispatchPointer(chart, 'pointerdown', { clientX: 100, pointerType: 'touch' })
    await tick()
    expect(onActiveChange).toHaveBeenLastCalledWith({ index: 5, value: 12, label: undefined })

    dispatchPointer(chart, 'pointerup', { pointerType: 'touch' })
    await tick()
    expect(onActiveChange).toHaveBeenLastCalledWith(null)
  })

  it('keeps a mouse reading visible after click (pointerup does not clear for mouse)', async () => {
    const onActiveChange = vi.fn()
    render(SparklineHost, { props: { data: DATA, onActiveChange, tooltip: true } })
    const chart = screen.getByRole('img')
    stubRect(chart, 100)

    dispatchPointer(chart, 'pointermove', { clientX: 0, pointerType: 'mouse' })
    dispatchPointer(chart, 'pointerup', { pointerType: 'mouse' })
    await tick()
    expect(onActiveChange).toHaveBeenLastCalledWith({ index: 0, value: 4, label: undefined })
  })

  it('mirrors the active index under RTL', async () => {
    const onActiveChange = vi.fn()
    render(SparklineHost, { props: { data: DATA, onActiveChange, rtl: true } })
    const chart = screen.getByRole('img')
    stubRect(chart, 100)
    dispatchPointer(chart, 'pointermove', { clientX: 0 })
    await tick()
    expect(onActiveChange).toHaveBeenLastCalledWith(expect.objectContaining({ index: DATA.length - 1 }))
  })

  it('forwards class onto the chart wrapper', () => {
    render(SparklineHost, { props: { data: DATA, chartClass: 'custom-chart', ariaLabel: 'Revenue' } })
    expect(screen.getByRole('img', { name: 'Revenue' }).className).toContain('custom-chart')
  })

  it('renders nothing for an empty dataset', () => {
    const { container } = render(SparklineHost, { props: { data: [] } })
    expect(container.querySelector('[data-slot=sparkline-svg]')).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(SparklineHost, {
      props: { data: DATA, labels: LABELS, showValue: true, variant: 'area', ariaLabel: 'Weekly revenue' },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
