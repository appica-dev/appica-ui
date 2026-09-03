import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { type Color, getChannelValue } from '../../lib/color'
import ColorPickerInput from './color-picker-input.svelte'
import ColorPickerHost from './color-picker.test-host.svelte'

const overlay = { hidden: true as const }

beforeAll(() => {
  const style = document.createElement('style')
  style.dataset.colorPickerTest = ''
  style.textContent =
    '[data-bits-floating-content-wrapper] { visibility: visible !important; transform: none !important; }'
  document.head.append(style)
})

afterAll(() => {
  document.querySelector('[data-color-picker-test]')?.remove()
})

const trigger = () => screen.getByTestId('trigger')
const hexField = () => screen.getByRole('textbox', { name: 'Hex', ...overlay }) as HTMLInputElement
const swatch = () => screen.getByRole('img')
const triggerSwatch = () => trigger().querySelector('[data-slot=color-swatch]') as HTMLElement

describe('ColorPicker', () => {
  it('renders a swatch trigger showing the color, and opens the default panel', async () => {
    const user = userEvent.setup()
    render(ColorPickerHost)

    expect(trigger()).toHaveTextContent('#3b82f6')
    expect(trigger()).toHaveAccessibleName(/vivid blue/)
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()

    await user.click(trigger())
    expect(screen.getByRole('group', { name: 'Saturation and brightness', ...overlay })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Hue', ...overlay })).toBeInTheDocument()
    expect(hexField()).toHaveValue('#3b82f6')
  })

  it('adds an alpha slider and keeps the opacity in the value', async () => {
    const user = userEvent.setup()
    render(ColorPickerHost, { props: { alpha: true, defaultValue: '#3b82f680' } })

    await user.click(trigger())
    expect(screen.getByRole('slider', { name: 'Alpha', ...overlay })).toBeInTheDocument()
    expect(hexField()).toHaveValue('#3b82f680')
  })

  it('drops the alpha digits from an opaque color', async () => {
    const user = userEvent.setup()
    const { container } = render(ColorPickerHost, { props: { alpha: true, name: 'brand' } })

    expect(trigger()).toHaveTextContent('#3b82f6')
    expect(container.querySelector('input[type=hidden]')).toHaveValue('#3b82f6')

    await user.click(trigger())
    expect(hexField()).toHaveValue('#3b82f6')

    const field = hexField()
    field.focus()
    field.value = '#3b82f680'
    field.dispatchEvent(new InputEvent('input', { bubbles: true }))
    expect(hexField()).toHaveValue('#3b82f680')
  })

  it('places the trigger swatch on either side of the label', async () => {
    const first = render(ColorPickerHost, { props: { label: 'Fill' } })
    expect(trigger().firstElementChild).toBe(triggerSwatch())
    first.unmount()

    render(ColorPickerHost, { props: { label: 'Fill', swatchPosition: 'end' } })
    expect(trigger().querySelector('span + [data-slot=color-swatch]')).toBe(triggerSwatch())
  })

  it('previews the color in the panel only when there is no trigger to do it', async () => {
    const user = userEvent.setup()
    const popover = render(ColorPickerHost)
    await user.click(trigger())
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    popover.unmount()

    render(ColorPickerHost, { props: { inline: true } })
    expect(swatch()).toHaveAccessibleName('vivid blue')
  })

  it('renders a panel with no trigger of its own', () => {
    render(ColorPickerHost, { props: { hideTrigger: true, open: true, name: 'brand', keepMounted: true } })
    expect(screen.queryByRole('button', { hidden: true })).not.toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Hue', ...overlay })).toBeInTheDocument()
    expect(document.querySelector('input[type=hidden]')).toHaveValue('#3b82f6')
  })

  it('anchors a triggerless panel through popoverProps', () => {
    render(ColorPickerHost, {
      props: { hideTrigger: true, open: true, name: 'brand', keepMounted: true, customAnchor: true },
    })
    expect(screen.getByTestId('field-anchor')).toBeInTheDocument()
    expect(screen.queryByRole('button', { hidden: true })).not.toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Hue', ...overlay })).toBeInTheDocument()
    expect(document.querySelector('input[type=hidden]')).toHaveValue('#3b82f6')
  })

  it('takes the button shell off the trigger when flush', () => {
    const first = render(ColorPickerHost, { props: { label: 'Fill' } })
    expect(trigger().className).toMatch(/\bpx-5\b/)
    first.unmount()

    render(ColorPickerHost, { props: { label: 'Fill', variant: 'flush' } })
    expect(trigger().className).not.toMatch(/\bpx-5\b/)
    expect(trigger().className).toMatch(/\bp-0\b/)
    expect(triggerSwatch().className).not.toMatch(/-ms-/)
  })

  it('keeps the text input from deciding how wide the panel is', () => {
    render(ColorPickerHost, { props: { inline: true } })
    expect(hexField()).toHaveAttribute('size', '1')
  })

  it('leaves alpha out by default', async () => {
    const user = userEvent.setup()
    render(ColorPickerHost, { props: { defaultValue: '#ffffff' } })

    await user.click(trigger())
    expect(screen.queryByRole('slider', { name: 'Alpha', ...overlay })).not.toBeInTheDocument()
  })

  it('renders the panel in place, with no trigger, when inline', () => {
    render(ColorPickerHost, { props: { inline: true } })
    expect(screen.queryByRole('button', { name: /blue/ })).not.toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Hue' })).toBeInTheDocument()
  })

  it('replaces the panel with custom children', () => {
    render(ColorPickerHost, { props: { inline: true, panel: 'hue' } })
    expect(screen.getByRole('slider', { name: 'Hue' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Saturation and brightness' })).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('shares one color between the composed controls', async () => {
    const user = userEvent.setup()
    render(ColorPickerHost, { props: { inline: true, defaultValue: '#ff0000', panel: 'shared' } })

    expect(swatch()).toHaveAccessibleName('vivid red')
    expect(screen.getByRole('slider', { name: 'Hue' })).toHaveValue('0')

    await user.click(screen.getByRole('option'))
    expect(swatch()).toHaveAccessibleName('vivid green')
    expect(screen.getByRole('slider', { name: 'Hue' })).toHaveValue('120')
  })

  it('lets a control keep its own value inside a picker', async () => {
    const user = userEvent.setup()
    render(ColorPickerHost, { props: { inline: true, defaultValue: '#ff0000', panel: 'locked-palette' } })

    await user.click(screen.getByRole('option'))
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'false')
    expect(swatch()).toHaveAccessibleName('vivid green')
  })

  it('reports every change, and commits once a gesture settles', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    const onValueCommitted = vi.fn<(value: Color) => void>()
    render(ColorPickerHost, {
      props: {
        inline: true,
        defaultValue: '#ff0000',
        panel: 'hue',
        onValueChange,
        onValueCommitted,
      },
    })

    screen.getByRole('slider', { name: 'Hue' }).focus()
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(onValueChange).toHaveBeenCalledTimes(2)
    expect(onValueCommitted).toHaveBeenCalledTimes(2)
    expect(getChannelValue(onValueCommitted.mock.calls[1]![0], 'hue')).toBe(2)
  })

  it('holds a controlled value until the consumer updates it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn<(value: Color) => void>()
    render(ColorPickerHost, {
      props: { inline: true, value: '#ff0000', panel: 'shared', onValueChange },
    })

    await user.click(screen.getByRole('option'))
    expect(onValueChange).toHaveBeenCalledOnce()
    expect(swatch()).toHaveAccessibleName('vivid red')
  })

  it('dims the trigger and every control when disabled', async () => {
    const user = userEvent.setup()
    render(ColorPickerHost, { props: { disabled: true } })
    expect(trigger()).toBeDisabled()

    await user.click(trigger())
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
  })

  it('names a hidden input for form submission', () => {
    const { container } = render(ColorPickerHost, {
      props: { inline: true, name: 'brand', alpha: true, defaultValue: '#3b82f680' },
    })
    expect(container.querySelector('input[type=hidden]')).toHaveValue('#3b82f680')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(ColorPickerHost, { props: { inline: true, eyedropper: true, alpha: true } })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations with the panel open', async () => {
    const user = userEvent.setup()
    render(ColorPickerHost, { props: { alpha: true, 'aria-label': 'Fill color' } })
    await user.click(trigger())
    const panel = document.querySelector('[data-slot=color-picker-panel]')
    expect(panel).toBeTruthy()
    expect(await axe(panel!)).toHaveNoViolations()
  })
})

describe('ColorPickerInput', () => {
  it('takes any color string the library can parse', async () => {
    const user = userEvent.setup()
    render(ColorPickerHost, { props: { inline: true, defaultValue: '#ff0000', panel: 'input' } })

    await user.clear(hexField())
    await user.type(hexField(), 'rgb(0, 255, 0)')
    expect(screen.getByRole('slider', { name: 'Hue' })).toHaveValue('120')

    await user.tab()
    expect(hexField()).toHaveValue('#00ff00')
  })

  it('accepts hex digits without the hash', async () => {
    const user = userEvent.setup()
    render(ColorPickerHost, { props: { inline: true, defaultValue: '#ff0000' } })

    await user.clear(hexField())
    await user.type(hexField(), '00f{Enter}')
    expect(hexField()).toHaveValue('#0000ff')
  })

  it('restores the color when the text is left unparseable', async () => {
    const user = userEvent.setup()
    render(ColorPickerHost, { props: { inline: true, defaultValue: '#ff0000' } })

    await user.clear(hexField())
    await user.type(hexField(), 'not a color')
    expect(hexField()).toHaveValue('not a color')

    await user.tab()
    expect(hexField()).toHaveValue('#ff0000')
  })

  it('writes the format it is given', () => {
    render(ColorPickerHost, { props: { inline: true, defaultValue: '#ff0000', panel: 'input-only', inputFormat: 'hsl' } })
    expect(screen.getByRole('textbox', { name: 'HSL' })).toHaveValue('hsl(0, 100%, 50%)')
  })

  it('honors inputSize and variant without losing the width contract', () => {
    render(ColorPickerHost, {
      props: { inline: true, panel: 'input-chrome', inputSize: 'md', inputVariant: 'soft' },
    })
    expect(hexField()).toHaveAttribute('size', '1')
    expect(hexField().className).toMatch(/\bh-10\b/)
    expect(hexField().className).toMatch(/bg-background-muted/)
  })

  it('refuses to render outside a picker', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(ColorPickerInput)).toThrow(/within <ColorPicker>/)
    error.mockRestore()
  })
})
