import * as React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { ColorArea } from './color-area'
import { type Color, convertColor, formatColor, getChannelValue, parseColor } from '../../lib/color'
import { DirectionProvider } from '../../providers/direction-provider'

const AREA_RECT = { x: 0, y: 0, top: 0, left: 0, right: 200, bottom: 200, width: 200, height: 200 }

function stubAreaSize() {
  vi.spyOn(HTMLDivElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ ...AREA_RECT, toJSON: () => AREA_RECT }) as DOMRect,
  )
}

function inputs() {
  return screen.getAllByRole('slider') as HTMLInputElement[]
}

describe('ColorArea', () => {
  it('keeps a surrounding Drawer from swiping on any drag that starts on the area', () => {
    const { container } = render(<ColorArea defaultValue="#3b82f6" />)
    expect(container.querySelector('[data-slot="color-area"]')).toHaveAttribute('data-base-ui-swipe-ignore', '')
  })

  it('exposes one range input per axis, labeled by channel', () => {
    render(<ColorArea defaultValue="hsb(0, 100%, 100%)" xChannel="saturation" yChannel="brightness" />)
    const [x, y] = inputs()

    expect(x).toHaveAttribute('aria-label', 'Color picker, Saturation')
    expect(x).toHaveAttribute('aria-orientation', 'horizontal')
    expect(y).toHaveAttribute('aria-label', 'Color picker, Brightness')
    expect(y).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('derives the color space from the value, and the free channel from the axes', () => {
    render(<ColorArea defaultValue="hsl(200, 50%, 50%)" />)
    expect(screen.getByRole('group')).toHaveAttribute('data-space', 'hsl')
    // Unspecified axes take the first free channels: hue on x, saturation on y.
    expect(inputs()[0]).toHaveValue('200')
    expect(inputs()[1]).toHaveValue('50')
  })

  it('honors an explicit colorSpace over the space of the value', () => {
    render(<ColorArea defaultValue="#ff0000" colorSpace="hsb" xChannel="saturation" yChannel="brightness" />)
    expect(screen.getByRole('group')).toHaveAttribute('data-space', 'hsb')
    expect(inputs()[0]).toHaveValue('100')
  })

  it('announces all three channels in aria-valuetext', () => {
    render(<ColorArea defaultValue="hsb(120, 40%, 60%)" xChannel="saturation" yChannel="brightness" />)
    expect(inputs()[0]).toHaveAttribute('aria-valuetext', 'Hue 120°, Saturation 40%, Brightness 60%')
  })

  it('moves the x channel on ArrowRight and the y channel on ArrowUp', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(
      <ColorArea
        defaultValue="hsb(0, 50%, 50%)"
        xChannel="saturation"
        yChannel="brightness"
        onValueChange={onValueChange}
      />,
    )

    inputs()[0]?.focus()
    await user.keyboard('{ArrowRight}')
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'saturation')).toBe(51)

    await user.keyboard('{ArrowUp}')
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'brightness')).toBe(51)
  })

  it('uses the page step when shift is held', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(
      <ColorArea
        defaultValue="hsb(0, 50%, 50%)"
        xChannel="saturation"
        yChannel="brightness"
        onValueChange={onValueChange}
      />,
    )

    inputs()[0]?.focus()
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'saturation')).toBe(60)
  })

  it('clamps at the ends of each channel range', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(
      <ColorArea
        defaultValue="hsb(0, 0%, 100%)"
        xChannel="saturation"
        yChannel="brightness"
        onValueChange={onValueChange}
      />,
    )

    inputs()[0]?.focus()
    await user.keyboard('{ArrowLeft}{ArrowUp}')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('reverses the horizontal axis in RTL', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(
      <DirectionProvider dir="rtl">
        <ColorArea
          defaultValue="hsb(0, 50%, 50%)"
          xChannel="saturation"
          yChannel="brightness"
          onValueChange={onValueChange}
        />
      </DirectionProvider>,
    )

    inputs()[0]?.focus()
    await user.keyboard('{ArrowRight}')
    expect(getChannelValue(onValueChange.mock.lastCall![0], 'saturation')).toBe(49)
  })

  it('sets both channels from a pointer press, with y increasing upwards', async () => {
    stubAreaSize()
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(
      <ColorArea
        defaultValue="hsb(0, 0%, 0%)"
        xChannel="saturation"
        yChannel="brightness"
        onValueChange={onValueChange}
      />,
    )

    // A quarter in from the left, a quarter down from the top.
    await user.pointer({ target: screen.getByRole('group'), coords: { clientX: 50, clientY: 50 }, keys: '[MouseLeft]' })

    const value = onValueChange.mock.lastCall![0]
    expect(getChannelValue(value, 'saturation')).toBe(25)
    expect(getChannelValue(value, 'brightness')).toBe(75)
  })

  it('fires onValueCommitted once the pointer is released', async () => {
    stubAreaSize()
    const user = userEvent.setup()
    const onValueCommitted = vi.fn<(value: Color) => void>()
    render(
      <ColorArea
        defaultValue="hsb(0, 0%, 0%)"
        xChannel="saturation"
        yChannel="brightness"
        onValueCommitted={onValueCommitted}
      />,
    )

    await user.pointer({ target: screen.getByRole('group'), coords: { clientX: 50, clientY: 50 }, keys: '[MouseLeft]' })
    expect(onValueCommitted).toHaveBeenCalledTimes(1)
    expect(formatColor(onValueCommitted.mock.lastCall![0], 'hsb')).toBe('hsb(0, 25%, 75%)')
  })

  it('stays on the controlled value when the parent ignores the change', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(
      <ColorArea value="hsb(0, 50%, 50%)" xChannel="saturation" yChannel="brightness" onValueChange={onValueChange} />,
    )

    inputs()[0]?.focus()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(inputs()[0]).toHaveValue('50')
  })

  it('follows a controlled value that the parent does update', async () => {
    function Controlled() {
      const [color, setColor] = React.useState<Color>(() => parseColor('hsb(0, 50%, 50%)'))
      return <ColorArea value={color} onValueChange={setColor} xChannel="saturation" yChannel="brightness" />
    }
    const user = userEvent.setup()
    render(<Controlled />)

    inputs()[0]?.focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(inputs()[0]).toHaveValue('52')
  })

  it('ignores interaction when disabled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(<ColorArea defaultValue="hsb(0, 50%, 50%)" disabled onValueChange={onValueChange} />)

    expect(screen.getByRole('group')).toHaveAttribute('data-disabled')
    expect(inputs()[0]).toBeDisabled()
    await user.click(screen.getByRole('group'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('drops the gradient when disabled, so the flat fill can show', () => {
    render(<ColorArea defaultValue="hsb(0, 50%, 50%)" disabled />)
    const area = screen.getByRole('group')
    // An inline background-image would paint straight over the disabled class.
    expect(area.style.backgroundImage).toBe('')
    const knob = area.querySelector('[data-slot="color-area-thumb"]') as HTMLElement
    expect(knob.style.backgroundColor).toBe('')
  })

  it('defaults to an rgb plane, including for a value whose space has none', () => {
    const { rerender } = render(<ColorArea />)
    expect(screen.getByRole('group')).toHaveAttribute('data-space', 'rgb')

    rerender(<ColorArea defaultValue="oklch(62.31% 0.188 259.81)" />)
    expect(screen.getByRole('group')).toHaveAttribute('data-space', 'rgb')
  })

  it('leaves the picked color unchanged when converted to another format', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(<ColorArea defaultValue="#3b82f6" onValueChange={onValueChange} />)

    inputs()[0]?.focus()
    await user.keyboard('{ArrowRight}{ArrowLeft}')
    // Format is independent of the space the area works in: a round trip through
    // the plane has to survive being written out in any of them.
    const picked = onValueChange.mock.lastCall![0]
    expect(formatColor(picked, 'hex')).toBe('#3b82f6')
    expect(convertColor(picked, 'hsb').space).toBe('hsb')
  })

  it('names the hidden inputs for form submission', () => {
    render(<ColorArea defaultValue="#ff0000" xName="red" yName="green" />)
    expect(inputs()[0]).toHaveAttribute('name', 'red')
    expect(inputs()[1]).toHaveAttribute('name', 'green')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ColorArea defaultValue="hsb(0, 50%, 50%)" aria-label="Background color" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
