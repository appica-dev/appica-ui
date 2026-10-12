import * as React from 'react'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { CompareSlider, type CompareSliderProps } from './compare-slider'
import { DirectionProvider } from '../../providers/direction-provider'

const RECT = { x: 0, y: 0, top: 0, left: 0, right: 200, bottom: 100, width: 200, height: 100 }

function stubSize() {
  vi.spyOn(HTMLDivElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ ...RECT, toJSON: () => RECT }) as DOMRect,
  )
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
  takeRecords = () => []
}

function renderSlider(props: Partial<CompareSliderProps> = {}) {
  return render(
    <CompareSlider
      data-testid="root"
      aria-label="Compare the sketch with the room"
      before={<img alt="Sketch" src="/sketch.png" />}
      after={<img alt="Room" src="/room.jpg" />}
      {...props}
    />,
  )
}

const slider = () => screen.getByRole('slider') as HTMLInputElement
const root = () => screen.getByTestId('root')
const layer = (side: 'before' | 'after') => root().querySelector(`[data-slot="compare-slider-${side}"]`) as HTMLElement

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  MockIntersectionObserver.instances = []
})

describe('CompareSlider', () => {
  it('renders both layers around a labeled slider set to 50', () => {
    renderSlider()
    expect(screen.getByRole('img', { name: 'Sketch' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Room' })).toBeInTheDocument()
    expect(slider()).toHaveAccessibleName('Compare the sketch with the room')
    expect(slider()).toHaveValue('50')
    expect(root()).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('clips each layer to its side of the divider, starting at defaultValue', () => {
    renderSlider({ defaultValue: 30 })
    expect(slider()).toHaveValue('30')
    expect(layer('before').style.clipPath).toBe('inset(0 70% 0 0)')
    expect(layer('after').style.clipPath).toBe('inset(0 0 0 30%)')
  })

  it('puts before on the right in a right-to-left layout', () => {
    render(
      <DirectionProvider dir="rtl">
        <CompareSlider data-testid="root" aria-label="Compare" defaultValue={30} before="Before" after="After" />
      </DirectionProvider>,
    )
    expect(layer('before').style.clipPath).toBe('inset(0 0 0 70%)')
    expect(layer('after').style.clipPath).toBe('inset(0 30% 0 0)')
  })

  it('stacks before above after when vertical', () => {
    renderSlider({ orientation: 'vertical', defaultValue: 30 })
    expect(root()).toHaveAttribute('data-orientation', 'vertical')
    expect(slider()).toHaveAttribute('aria-orientation', 'vertical')
    expect(layer('before').style.clipPath).toBe('inset(0 0 70% 0)')
    expect(layer('after').style.clipPath).toBe('inset(30% 0 0 0)')
  })

  it('moves the divider to a mouse press, follows the drag and commits on release', async () => {
    stubSize()
    const onValueChange = vi.fn()
    const onValueCommitted = vi.fn()
    const user = userEvent.setup()
    renderSlider({ onValueChange, onValueCommitted })

    await user.pointer([
      { keys: '[MouseLeft>]', target: root(), coords: { clientX: 50, clientY: 50 } },
      { target: root(), coords: { clientX: 150, clientY: 50 } },
    ])
    expect(onValueChange).toHaveBeenNthCalledWith(1, 25)
    expect(slider()).toHaveValue('75')
    expect(root()).toHaveAttribute('data-dragging')
    expect(onValueCommitted).not.toHaveBeenCalled()

    await user.pointer({ keys: '[/MouseLeft]', target: root() })
    expect(onValueCommitted).toHaveBeenCalledExactlyOnceWith(75)
    expect(root()).not.toHaveAttribute('data-dragging')
  })

  it('leaves a touch swipe across the axis to the page, and follows one along it', async () => {
    stubSize()
    const user = userEvent.setup()
    renderSlider()

    await user.pointer([
      { keys: '[TouchA>]', target: root(), coords: { clientX: 100, clientY: 10 } },
      { pointerName: 'TouchA', target: root(), coords: { clientX: 104, clientY: 60 } },
      { keys: '[/TouchA]', target: root() },
    ])
    expect(slider()).toHaveValue('50')

    await user.pointer([
      { keys: '[TouchA>]', target: root(), coords: { clientX: 100, clientY: 50 } },
      { pointerName: 'TouchA', target: root(), coords: { clientX: 60, clientY: 52 } },
      { pointerName: 'TouchA', target: root(), coords: { clientX: 40, clientY: 52 } },
      { keys: '[/TouchA]', target: root() },
    ])
    expect(slider()).toHaveValue('20')
  })

  it('moves the divider to a tap, but not to a touch the page takes over for scrolling', async () => {
    stubSize()
    const onValueCommitted = vi.fn()
    const user = userEvent.setup()
    renderSlider({ onValueCommitted })

    await user.pointer({ keys: '[TouchA]', target: root(), coords: { clientX: 40, clientY: 50 } })
    expect(slider()).toHaveValue('20')
    expect(onValueCommitted).toHaveBeenCalledExactlyOnceWith(20)

    fireEvent.pointerDown(root(), { pointerType: 'touch', pointerId: 2, clientX: 150, clientY: 50 })
    expect(root()).toHaveAttribute('data-dragging')
    fireEvent.pointerCancel(root(), { pointerType: 'touch', pointerId: 2, clientX: 150, clientY: 50 })
    expect(root()).not.toHaveAttribute('data-dragging')
    expect(slider()).toHaveValue('20')
    expect(onValueCommitted).toHaveBeenCalledTimes(1)
  })

  it('steps with the arrow keys, by 10 with Shift, and jumps to the ends with Home and End', async () => {
    const onValueCommitted = vi.fn()
    const user = userEvent.setup()
    renderSlider({ onValueCommitted })

    slider().focus()
    await user.keyboard('{ArrowRight}')
    expect(slider()).toHaveValue('51')
    expect(onValueCommitted).toHaveBeenLastCalledWith(51)
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    expect(slider()).toHaveValue('41')
    await user.keyboard('{Home}')
    expect(slider()).toHaveValue('0')
    await user.keyboard('{End}')
    expect(slider()).toHaveValue('100')
  })

  it('moves the divider the way the arrow points, in RTL and when vertical', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <DirectionProvider dir="rtl">
        <CompareSlider aria-label="Compare" before="Before" after="After" />
      </DirectionProvider>,
    )
    slider().focus()
    await user.keyboard('{ArrowLeft}')
    expect(slider()).toHaveValue('51')
    unmount()

    renderSlider({ orientation: 'vertical' })
    slider().focus()
    await user.keyboard('{ArrowDown}')
    expect(slider()).toHaveValue('51')
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(slider()).toHaveValue('49')
  })

  it('reports changes but holds its position while controlled', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    const { rerender } = renderSlider({ value: 20, onValueChange })

    slider().focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledWith(21)
    expect(slider()).toHaveValue('20')

    rerender(<CompareSlider aria-label="Compare" value={60} before="Before" after="After" />)
    expect(slider()).toHaveValue('60')
  })

  it('draws a double arrow that follows orientation, and takes a replacement icon', () => {
    const handlePath = () => root().querySelector('[data-slot="compare-slider-handle"] path')?.getAttribute('d')
    const { rerender } = renderSlider()
    const horizontal = handlePath()
    rerender(<CompareSlider data-testid="root" orientation="vertical" before="Before" after="After" />)
    expect(handlePath()).not.toBe(horizontal)

    rerender(
      <CompareSlider data-testid="root" icon={<svg data-testid="custom-icon" />} before="Before" after="After" />,
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(root().querySelectorAll('[data-slot="compare-slider-handle"] svg')).toHaveLength(1)
  })

  it('pins each label inside its own layer, so it clips with that side', () => {
    const { rerender } = renderSlider({ beforeLabel: 'Drawing', afterLabel: 'Photo' })
    expect(within(layer('before')).getByText('Drawing')).toHaveAttribute('data-slot', 'compare-slider-label')
    expect(within(layer('after')).getByText('Photo')).toHaveAttribute('data-slot', 'compare-slider-label')

    rerender(<CompareSlider data-testid="root" before="Before" after="After" />)
    expect(root().querySelector('[data-slot="compare-slider-label"]')).toBeNull()
  })

  it('opens on before alone with reveal, then moves to defaultValue once in view', () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    renderSlider({ reveal: true, defaultValue: 40 })
    expect(slider()).toHaveValue('100')
    expect(layer('after').style.clipPath).toBe('inset(0 0 0 100%)')

    act(() => {
      MockIntersectionObserver.instances[0]!.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        MockIntersectionObserver.instances[0] as unknown as IntersectionObserver,
      )
    })
    expect(slider()).toHaveValue('40')
  })

  it('ignores presses and keys while disabled', async () => {
    stubSize()
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    renderSlider({ disabled: true, onValueChange })

    expect(slider()).toBeDisabled()
    expect(root()).toHaveAttribute('data-disabled')
    await user.pointer({ keys: '[MouseLeft]', target: root(), coords: { clientX: 20, clientY: 50 } })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(slider()).toHaveValue('50')
  })

  it('claims drags along its own axis from a surrounding Drawer', () => {
    const { unmount } = renderSlider()
    expect(root()).toHaveAttribute('data-base-ui-swipe-ignore', 'x')
    unmount()
    renderSlider({ orientation: 'vertical' })
    expect(root()).toHaveAttribute('data-base-ui-swipe-ignore', 'y')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderSlider({ beforeLabel: 'Drawing', afterLabel: 'Photo' })
    expect(await axe(container)).toHaveNoViolations()
  })
})
