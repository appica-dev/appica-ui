import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { type Color, formatColor, parseColor } from '../../lib/color'
import ColorSwatchPickerItem from './color-swatch-picker-item.svelte'
import ColorSwatchPickerHost from './color-swatch-picker.test-host.svelte'

const options = () => screen.getAllByRole('option')
const indicator = () => document.querySelector('[data-slot=color-swatch-picker-indicator]')

describe('ColorSwatchPicker', () => {
  it('exposes the palette as a single-select listbox', () => {
    render(ColorSwatchPickerHost, { props: { defaultValue: '#3b82f6' } })
    expect(screen.getByRole('listbox')).toHaveAccessibleName('Brand color')
    expect(options()).toHaveLength(4)
    expect(options()[3]).toHaveAttribute('aria-selected', 'true')
    expect(options()[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('names each swatch from its color, and takes an override', () => {
    render(ColorSwatchPickerHost, { props: { palette: ['#3b82f6', '#ef4444'], named: true } })
    expect(options()[0]).toHaveAccessibleName('vivid blue')
    expect(options()[1]).toHaveAccessibleName('Fire truck red')
  })

  it('selects on click and reports the color', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(ColorSwatchPickerHost, { props: { defaultValue: '#ef4444', onValueChange } })

    await user.click(options()[2]!)
    expect(formatColor(onValueChange.mock.lastCall![0], 'hex')).toBe('#22c55e')
    expect(options()[2]).toHaveAttribute('aria-selected', 'true')
    expect(options()[0]).toHaveAttribute('aria-selected', 'false')
  })

  it('matches the same color written in another space', () => {
    render(ColorSwatchPickerHost, {
      props: { palette: ['#ff0000', '#00ff00'], value: parseColor('hsl(0, 100%, 50%)') },
    })
    expect(options()[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('stays put when controlled and the value does not change', async () => {
    const user = userEvent.setup()
    render(ColorSwatchPickerHost, { props: { value: '#ef4444', onValueChange: () => {} } })
    await user.click(options()[2]!)
    expect(options()[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('keeps one tab stop, on the selected swatch', () => {
    render(ColorSwatchPickerHost, { props: { defaultValue: '#22c55e' } })
    expect(options().map((option) => option.tabIndex)).toEqual([-1, -1, 0, -1])
  })

  it('falls back to the first swatch when nothing is selected', () => {
    render(ColorSwatchPickerHost)
    expect(options().map((option) => option.tabIndex)).toEqual([0, -1, -1, -1])
    expect(indicator()).not.toBeInTheDocument()
  })

  it('moves selection with the arrow keys, and wraps', async () => {
    const user = userEvent.setup()
    render(ColorSwatchPickerHost, { props: { defaultValue: '#ef4444' } })

    options()[0]!.focus()
    await user.keyboard('{ArrowRight}')
    expect(options()[1]).toHaveAttribute('aria-selected', 'true')
    expect(options()[1]).toHaveFocus()

    await user.keyboard('{End}')
    expect(options()[3]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowRight}')
    expect(options()[0]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{Home}')
    expect(options()[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('reverses the horizontal arrows in RTL', async () => {
    const user = userEvent.setup()
    render(ColorSwatchPickerHost, { props: { dir: 'rtl', defaultValue: '#f59e0b' } })

    options()[1]!.focus()
    await user.keyboard('{ArrowRight}')
    expect(options()[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('walks a stack with the vertical arrows', async () => {
    const user = userEvent.setup()
    render(ColorSwatchPickerHost, { props: { layout: 'stack', defaultValue: '#ef4444' } })
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-orientation', 'vertical')

    options()[0]!.focus()
    await user.keyboard('{ArrowDown}')
    expect(options()[1]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowUp}')
    expect(options()[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('jumps a row at a time in a wrapped grid', async () => {
    const user = userEvent.setup()
    render(ColorSwatchPickerHost, { props: { defaultValue: '#ef4444' } })

    const boxes = [
      [0, 0],
      [50, 0],
      [0, 50],
      [50, 50],
    ]
    options().forEach((option, index) => {
      Object.defineProperty(option, 'offsetLeft', { value: boxes[index]![0], configurable: true })
      Object.defineProperty(option, 'offsetTop', { value: boxes[index]![1], configurable: true })
    })

    options()[1]!.focus()
    await user.keyboard('{ArrowDown}')
    expect(options()[3]).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowUp}')
    expect(options()[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('skips a disabled swatch and refuses to select it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(ColorSwatchPickerHost, {
      props: {
        palette: ['#ef4444', '#f59e0b', '#22c55e'],
        defaultValue: '#ef4444',
        onValueChange,
        skipSecond: true,
      },
    })

    expect(options()[1]).toBeDisabled()
    expect(options()[1]!.querySelector('[data-slot=color-swatch]')).toHaveAttribute('data-disabled')
    expect(options()[1]!.querySelector<HTMLElement>('[data-slot=color-swatch]')!.style.backgroundColor).toBe('')
    await user.click(options()[1]!)
    expect(onValueChange).not.toHaveBeenCalled()

    options()[0]!.focus()
    await user.keyboard('{ArrowRight}')
    expect(options()[2]).toHaveAttribute('aria-selected', 'true')
  })

  it('disables every swatch from the root', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(ColorSwatchPickerHost, { props: { disabled: true, onValueChange } })
    expect(screen.getByRole('listbox')).toHaveAttribute('data-disabled')
    await user.click(options()[1]!)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('sizes the swatch off the button, so the ring gap scales with it', () => {
    render(ColorSwatchPickerHost, { props: { palette: ['#3b82f6'], size: 'lg' } })
    expect(screen.getByRole('listbox')).toHaveClass('text-[3rem]')
    const swatch = document.querySelector('[data-slot=color-swatch]')!
    expect(swatch.className).toContain('text-[0.8em]')
    expect(swatch.className).not.toContain('text-[2.5rem]')
  })

  it('draws one indicator, not a border per swatch', () => {
    render(ColorSwatchPickerHost, { props: { defaultValue: '#3b82f6' } })
    expect(document.querySelectorAll('[data-slot=color-swatch-picker-indicator]')).toHaveLength(1)
    expect(indicator()).toHaveAttribute('aria-hidden', 'true')
  })

  it('throws when an item is rendered outside a picker', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(ColorSwatchPickerItem, { props: { color: '#3b82f6' } })).toThrow(/within <ColorSwatchPicker>/)
    error.mockRestore()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(ColorSwatchPickerHost, { props: { defaultValue: '#3b82f6' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
