import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Sparkline, SparklineChart, SparklineValue, SparklineLabel } from './sparkline'
import { DirectionProvider } from '../../providers/direction-provider'

const DATA = [4, 8, 6, 10, 7, 12]
const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** jsdom returns a 0×0 rect; give the chart a real width so pointer mapping runs. */
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

describe('Sparkline', () => {
  it('claims horizontal drags from a surrounding Drawer only while it is interactive', () => {
    const chart = (container: HTMLElement) => container.querySelector('[data-slot="sparkline-svg"]')!.parentElement
    const { container: interactive } = render(
      <Sparkline data={DATA}>
        <SparklineChart />
      </Sparkline>,
    )
    expect(chart(interactive)).toHaveAttribute('data-base-ui-swipe-ignore', 'x')
    const { container: still } = render(
      <Sparkline data={DATA}>
        <SparklineChart indicator={false} />
      </Sparkline>,
    )
    expect(chart(still)).not.toHaveAttribute('data-base-ui-swipe-ignore')
  })

  it('renders a line path for the line variant', () => {
    const { container } = render(
      <Sparkline data={DATA}>
        <SparklineChart variant="line" />
      </Sparkline>,
    )
    expect(container.querySelector('[data-slot=sparkline-line]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot=sparkline-area]')).not.toBeInTheDocument()
  })

  it('renders a baseline-anchored fill for the area variant', () => {
    const { container } = render(
      <Sparkline data={DATA}>
        <SparklineChart variant="area" />
      </Sparkline>,
    )
    expect(container.querySelector('[data-slot=sparkline-fill]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot=sparkline-baseline]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot=sparkline-line]')).toBeInTheDocument()
  })

  it('line variant is stroke-only by default, gaining a gradient fill only when `fill` is set', () => {
    const { container, rerender } = render(
      <Sparkline data={DATA}>
        <SparklineChart variant="line" />
      </Sparkline>,
    )
    expect(container.querySelector('[data-slot=sparkline-fill]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot=sparkline-baseline]')).not.toBeInTheDocument()

    rerender(
      <Sparkline data={DATA}>
        <SparklineChart variant="line" fill />
      </Sparkline>,
    )
    expect(container.querySelector('[data-slot=sparkline-fill]')).toBeInTheDocument()
    expect(container.querySelector('[data-slot=sparkline-baseline]')).not.toBeInTheDocument()
  })

  it('renders one column per data point plus a baseline for the column variant', () => {
    const { container } = render(
      <Sparkline data={DATA}>
        <SparklineChart variant="column" />
      </Sparkline>,
    )
    expect(container.querySelectorAll('[data-slot=sparkline-column]')).toHaveLength(DATA.length)
    expect(container.querySelector('[data-slot=sparkline-baseline]')).toBeInTheDocument()
  })

  it('column highlight is gated on `indicator`, independent of the tooltip', () => {
    const { container } = render(
      <Sparkline data={DATA}>
        <SparklineChart variant="column" indicator={false} tooltip />
      </Sparkline>,
    )
    const chart = screen.getByRole('img')
    stubRect(chart, 100)
    fireEvent.pointerMove(chart, { clientX: 50 })
    // Tooltip renders, but with indicator off no column is highlighted.
    expect(container.querySelector('[data-slot=sparkline-tooltip]')).toBeInTheDocument()
    expect(container.querySelector('[data-active]')).not.toBeInTheDocument()
  })

  it('columns pivot on the baseline: positive bars round the top, negatives round the bottom', () => {
    const { container } = render(
      <Sparkline data={[6, -4]}>
        <SparklineChart variant="column" />
      </Sparkline>,
    )
    const bars = container.querySelectorAll('[data-slot=sparkline-column]')
    expect(bars[0]!.className).toContain('rounded-t-')
    expect(bars[1]!.className).toContain('rounded-b-')
  })

  it('sets the accent color as a CSS variable on the root', () => {
    render(
      <Sparkline data={DATA} color="var(--color-success)" data-testid="root">
        <SparklineChart />
      </Sparkline>,
    )
    expect(screen.getByTestId('root').style.getPropertyValue('--sparkline-color')).toBe('var(--color-success)')
  })

  it('SparklineValue shows the last value by default, formatted', () => {
    render(
      <Sparkline data={DATA} format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}>
        <SparklineValue />
        <SparklineChart />
      </Sparkline>,
    )
    expect(screen.getByText('$12')).toBeInTheDocument()
  })

  it('SparklineLabel renders nothing without labels and the last label with them', () => {
    const { rerender } = render(
      <Sparkline data={DATA}>
        <SparklineLabel data-testid="label" />
      </Sparkline>,
    )
    expect(screen.queryByTestId('label')).not.toBeInTheDocument()

    rerender(
      <Sparkline data={DATA} labels={LABELS}>
        <SparklineLabel data-testid="label" />
      </Sparkline>,
    )
    expect(screen.getByTestId('label')).toHaveTextContent('Sat')
  })

  it('does not render the tooltip until hovered', () => {
    const { container } = render(
      <Sparkline data={DATA} labels={LABELS}>
        <SparklineChart tooltip />
      </Sparkline>,
    )
    expect(container.querySelector('[data-slot=sparkline-tooltip]')).not.toBeInTheDocument()
  })

  it('activates the nearest point on hover: updates value, tooltip, and onActiveChange', () => {
    const onActiveChange = vi.fn()
    const { container } = render(
      <Sparkline data={DATA} labels={LABELS} onActiveChange={onActiveChange}>
        <SparklineValue />
        <SparklineChart tooltip />
      </Sparkline>,
    )
    // Mount must NOT fire a phantom null before any interaction.
    expect(onActiveChange).not.toHaveBeenCalled()

    const chart = screen.getByRole('img')
    stubRect(chart, 100)

    // clientX 0 → t=0 → nearest index 0 (value 4).
    fireEvent.pointerMove(chart, { clientX: 0 })
    expect(onActiveChange).toHaveBeenLastCalledWith({ index: 0, value: 4, label: 'Mon' })
    expect(container.querySelector('[data-slot=sparkline-value]')).toHaveTextContent('4')
    expect(container.querySelector('[data-slot=sparkline-tooltip]')).toHaveTextContent('Mon')

    // clientX 100 → t=1 → last index 5 (value 12).
    fireEvent.pointerMove(chart, { clientX: 100 })
    expect(onActiveChange).toHaveBeenLastCalledWith({ index: 5, value: 12, label: 'Sat' })

    fireEvent.pointerLeave(chart)
    expect(onActiveChange).toHaveBeenLastCalledWith(null)
  })

  it('activates on a stationary touch tap and clears when the finger lifts', () => {
    const onActiveChange = vi.fn()
    render(
      <Sparkline data={DATA} onActiveChange={onActiveChange}>
        <SparklineChart tooltip />
      </Sparkline>,
    )
    const chart = screen.getByRole('img')
    stubRect(chart, 100)

    // A touch tap fires pointerdown without a preceding move - it must activate immediately.
    fireEvent.pointerDown(chart, { clientX: 100, pointerType: 'touch' })
    expect(onActiveChange).toHaveBeenLastCalledWith({ index: 5, value: 12, label: undefined })

    // Lifting the finger dismisses (there is no pointerleave on touch).
    fireEvent.pointerUp(chart, { pointerType: 'touch' })
    expect(onActiveChange).toHaveBeenLastCalledWith(null)
  })

  it('keeps a mouse reading visible after click (pointerup does not clear for mouse)', () => {
    const onActiveChange = vi.fn()
    render(
      <Sparkline data={DATA} onActiveChange={onActiveChange}>
        <SparklineChart tooltip />
      </Sparkline>,
    )
    const chart = screen.getByRole('img')
    stubRect(chart, 100)

    fireEvent.pointerMove(chart, { clientX: 0, pointerType: 'mouse' })
    fireEvent.pointerUp(chart, { pointerType: 'mouse' })
    expect(onActiveChange).toHaveBeenLastCalledWith({ index: 0, value: 4, label: undefined })
  })

  it('mirrors the active index under RTL', () => {
    const onActiveChange = vi.fn()
    render(
      <DirectionProvider dir="rtl">
        <Sparkline data={DATA} onActiveChange={onActiveChange}>
          <SparklineChart />
        </Sparkline>
      </DirectionProvider>,
    )
    const chart = screen.getByRole('img')
    stubRect(chart, 100)
    // Pointer at the left edge maps to the last index when mirrored.
    fireEvent.pointerMove(chart, { clientX: 0 })
    expect(onActiveChange).toHaveBeenLastCalledWith(expect.objectContaining({ index: DATA.length - 1 }))
  })

  it('forwards className onto the chart wrapper', () => {
    render(
      <Sparkline data={DATA}>
        <SparklineChart className="custom-chart" aria-label="Revenue" />
      </Sparkline>,
    )
    expect(screen.getByRole('img', { name: 'Revenue' }).className).toContain('custom-chart')
  })

  it('renders nothing for an empty dataset', () => {
    const { container } = render(
      <Sparkline data={[]}>
        <SparklineChart />
      </Sparkline>,
    )
    expect(container.querySelector('[data-slot=sparkline-svg]')).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Sparkline data={DATA} labels={LABELS}>
        <SparklineValue />
        <SparklineChart variant="area" aria-label="Weekly revenue" />
      </Sparkline>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
