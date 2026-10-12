import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { axe } from 'vitest-axe'
import { ColorSlider, type ColorSliderProps } from './color-slider'
import { ColorArea } from '../color-area/color-area'
import { type Color, getChannelValue, parseColor } from '../../lib/color'
import { DirectionProvider } from '../../providers/direction-provider'

const RECT = { x: 0, y: 0, top: 0, left: 0, right: 200, bottom: 200, width: 200, height: 200 }

function stubSize() {
  vi.spyOn(HTMLDivElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ ...RECT, toJSON: () => RECT }) as DOMRect,
  )
}

/** jsdom lays nothing out, so stand in a track thickness and a thumb size. */
function stubGeometry(track: number, thumb: number) {
  const extent = (element: HTMLElement) => (element.dataset.slot === 'color-slider-thumb' ? thumb : track)
  for (const property of ['offsetWidth', 'offsetHeight'] as const) {
    vi.spyOn(HTMLElement.prototype, property, 'get').mockImplementation(function (this: HTMLElement) {
      return extent(this)
    })
  }
}

function renderSlider(props: ColorSliderProps) {
  return render(<ColorSlider data-testid="track" {...props} />)
}

const slider = () => screen.getByRole('slider') as HTMLInputElement
const track = () => screen.getByTestId('track')
const thumb = () => document.querySelector('[data-slot="color-slider-thumb"]') as HTMLElement
const stopCount = () => (track().style.backgroundImage.match(/rgba?\(/g) ?? []).length

describe('ColorSlider', () => {
  it('keeps a surrounding Drawer from swiping on any drag that starts on the slider', () => {
    const { container } = renderSlider({ channel: 'hue', defaultValue: '#3b82f6' })
    expect(container.querySelector('[data-slot="color-slider"]')).toHaveAttribute('data-base-ui-swipe-ignore', '')
  })

  it('exposes the channel as a labeled range input', () => {
    renderSlider({ channel: 'hue', defaultValue: 'hsb(120, 50%, 50%)' })
    expect(slider()).toHaveAttribute('aria-label', 'Hue')
    expect(slider()).toHaveAttribute('min', '0')
    expect(slider()).toHaveAttribute('max', '360')
    expect(slider()).toHaveValue('120')
  })

  it('reads a channel the value space lacks from that channel home space', () => {
    // A hex value is RGB, which has no hue, so hue comes from HSB.
    renderSlider({ channel: 'hue', defaultValue: '#ff0000' })
    expect(slider()).toHaveValue('0')
  })

  it('keeps the value space when it already carries the channel', () => {
    renderSlider({ channel: 'lightness', defaultValue: 'hsl(200, 50%, 40%)' })
    expect(slider()).toHaveValue('40')
  })

  it('leaves the space alone for alpha, which every space carries', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    renderSlider({ channel: 'alpha', defaultValue: 'hsb(217, 76%, 96%)', onValueChange })

    slider().focus()
    await user.keyboard('{ArrowLeft}')
    // Converting to RGB here would strip the channels a sibling area reads.
    expect(onValueChange.mock.lastCall![0].space).toBe('hsb')
  })

  it('moves by step, by page step with shift, and jumps with Home and End', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    renderSlider({ channel: 'hue', defaultValue: 'hsb(120, 50%, 50%)', onValueChange })

    slider().focus()
    await user.keyboard('{ArrowRight}')
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'hue')).toBe(121)

    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'hue')).toBe(136)

    await user.keyboard('{End}')
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'hue')).toBe(360)

    await user.keyboard('{Home}')
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'hue')).toBe(0)
  })

  it('reverses the horizontal arrow keys in RTL', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(
      <DirectionProvider dir="rtl">
        <ColorSlider channel="hue" defaultValue="hsb(120, 50%, 50%)" onValueChange={onValueChange} />
      </DirectionProvider>,
    )

    slider().focus()
    await user.keyboard('{ArrowRight}')
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'hue')).toBe(119)
  })

  it('leaves the vertical arrow keys alone in RTL', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(
      <DirectionProvider dir="rtl">
        <ColorSlider
          channel="hue"
          orientation="vertical"
          defaultValue="hsb(120, 50%, 50%)"
          onValueChange={onValueChange}
        />
      </DirectionProvider>,
    )

    slider().focus()
    await user.keyboard('{ArrowUp}')
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'hue')).toBe(121)
  })

  it('sets the channel from a pointer press along the track', async () => {
    stubSize()
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    renderSlider({ channel: 'hue', defaultValue: 'hsb(0, 50%, 50%)', onValueChange })

    await user.pointer({ target: track(), coords: { clientX: 50, clientY: 10 }, keys: '[MouseLeft]' })
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'hue')).toBe(90)
  })

  it('fills a vertical track from the bottom', async () => {
    stubSize()
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    renderSlider({ channel: 'hue', orientation: 'vertical', defaultValue: 'hsb(0, 50%, 50%)', onValueChange })

    // A quarter down from the top is three quarters up the track.
    await user.pointer({ target: track(), coords: { clientX: 10, clientY: 50 }, keys: '[MouseLeft]' })
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'hue')).toBe(270)
  })

  it('fires onValueCommitted once per gesture', async () => {
    stubSize()
    const user = userEvent.setup()
    const onValueCommitted = vi.fn<(value: Color) => void>()
    renderSlider({ channel: 'hue', defaultValue: 'hsb(0, 50%, 50%)', onValueCommitted })

    await user.pointer({ target: track(), coords: { clientX: 50, clientY: 10 }, keys: '[MouseLeft]' })
    expect(onValueCommitted).toHaveBeenCalledTimes(1)
  })

  it('ignores interaction when disabled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    renderSlider({ channel: 'hue', defaultValue: 'hsb(0, 50%, 50%)', disabled: true, onValueChange })

    expect(track()).toHaveAttribute('data-disabled')
    expect(slider()).toBeDisabled()
    await user.click(track())
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('drops the gradient when disabled, so the flat fill can show', () => {
    renderSlider({ channel: 'alpha', defaultValue: 'rgba(255, 0, 0, 0.5)', disabled: true })
    // An inline background-image would paint straight over the disabled class.
    expect(track().style.backgroundImage).toBe('')
    expect(track().style.backgroundSize).toBe('')
    expect(thumb().style.backgroundColor).toBe('')
  })

  it('names the hidden input for form submission', () => {
    renderSlider({ channel: 'hue', defaultValue: 'hsb(0, 50%, 50%)', name: 'hue' })
    expect(slider()).toHaveAttribute('name', 'hue')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderSlider({ channel: 'hue', defaultValue: 'hsb(0, 50%, 50%)', 'aria-label': 'Hue' })
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('ColorSlider thumb inset', () => {
  // The geometry stubs sit on HTMLElement.prototype, so they have to come back off.
  afterEach(() => vi.restoreAllMocks())

  it('holds the thumb inside the track at both ends', () => {
    stubGeometry(20, 18)
    const { rerender } = renderSlider({ channel: 'saturation', value: 'hsb(200, 0%, 100%)' })
    // Half a thumb (9) plus the 1px of track it already clears, at each end.
    expect(thumb().style.insetInlineStart).toBe('10px')

    rerender(<ColorSlider data-testid="track" channel="saturation" value="hsb(200, 100%, 100%)" />)
    expect(thumb().style.insetInlineStart).toBe('calc(100% - 10px)')
  })

  it('insets a vertical track along its own axis', () => {
    stubGeometry(20, 18)
    renderSlider({ channel: 'saturation', orientation: 'vertical', value: 'hsb(200, 100%, 100%)' })
    expect(thumb().style.top).toBe('10px')
    expect(thumb().style.insetInlineStart).toBe('50%')
  })

  it('maps a press against the inset track, not the full width', async () => {
    stubGeometry(20, 18)
    stubSize()
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    renderSlider({ channel: 'hue', defaultValue: 'hsb(0, 50%, 50%)', onValueChange })

    // 200px wide with 10px off each end, so the middle of the travel is x = 100.
    await user.pointer({ target: track(), coords: { clientX: 100, clientY: 10 }, keys: '[MouseLeft]' })
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'hue')).toBe(180)

    // The very edge still reaches the minimum rather than stopping short of it.
    await user.pointer({ target: track(), coords: { clientX: 0, clientY: 10 }, keys: '[MouseLeft]' })
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'hue')).toBe(0)
  })

  // The ramp's matching inset has no test here: jsdom's CSS parser rejects any
  // `calc()` inside a gradient color stop and drops the whole declaration, so
  // `style.backgroundImage` never sees it. Verified in the browser instead.
})
