import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import Slider from './slider.svelte'
import SliderControlledHost from './slider.controlled-host.svelte'

describe('Slider', () => {
  it('renders a single thumb when no value is provided', () => {
    render(Slider, { props: { thumbAriaLabel: 'Volume' } })
    const thumbs = screen.getAllByRole('slider')
    expect(thumbs).toHaveLength(1)
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Volume')
  })

  it('reflects defaultValue for a single thumb', () => {
    render(Slider, { props: { defaultValue: 42, thumbAriaLabel: 'Volume' } })
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '42')
  })

  it('renders one thumb per value in a range slider', () => {
    render(Slider, {
      props: { defaultValue: [20, 80], thumbAriaLabel: (i: number) => (i === 0 ? 'Min' : 'Max') },
    })
    const thumbs = screen.getAllByRole('slider')
    expect(thumbs).toHaveLength(2)
    expect(thumbs[0]).toHaveAttribute('aria-valuenow', '20')
    expect(thumbs[1]).toHaveAttribute('aria-valuenow', '80')
    expect(thumbs[0]).toHaveAttribute('aria-label', 'Min')
    expect(thumbs[1]).toHaveAttribute('aria-label', 'Max')
  })

  it('forwards min, max, step to the thumb', () => {
    render(Slider, { props: { defaultValue: 5, min: 0, max: 20, step: 2, thumbAriaLabel: 'Volume' } })
    const thumb = screen.getByRole('slider')
    expect(thumb).toHaveAttribute('aria-valuemin', '0')
    expect(thumb).toHaveAttribute('aria-valuemax', '20')
  })

  it('fires onValueChange with the new value on ArrowRight', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(Slider, { props: { defaultValue: 10, onValueChange, thumbAriaLabel: 'Volume' } })

    const thumb = screen.getByRole('slider')
    thumb.focus()
    await user.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenCalled()
    expect(onValueChange.mock.calls[0]![0]).toBe(11)
  })

  it('does not fire onValueChange when disabled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(Slider, { props: { defaultValue: 10, disabled: true, onValueChange, thumbAriaLabel: 'Volume' } })

    const thumb = screen.getByRole('slider')
    thumb.focus()
    await user.keyboard('{ArrowRight}')

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('respects controlled value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(SliderControlledHost, { props: { locked: 30, onValueChange } })

    const thumb = screen.getByRole('slider')
    thumb.focus()
    await user.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenCalled()
    expect(thumb).toHaveAttribute('aria-valuenow', '30')
  })

  it('sets data-orientation on the root for vertical sliders', () => {
    const { container } = render(Slider, {
      props: { orientation: 'vertical', defaultValue: 50, thumbAriaLabel: 'Volume' },
    })
    const root = container.querySelector('[data-slot="slider"]')
    expect(root).toHaveAttribute('data-orientation', 'vertical')
  })

  it('does not render a tooltip when tooltipVisibility="never"', () => {
    const { container } = render(Slider, {
      props: { defaultValue: 50, tooltipVisibility: 'never', thumbAriaLabel: 'Volume' },
    })
    expect(container.querySelector('[data-slot="slider-tooltip"]')).toBeNull()
  })

  it('renders a tooltip per thumb when tooltipVisibility="always"', () => {
    const { container } = render(Slider, {
      props: {
        defaultValue: [10, 90],
        tooltipVisibility: 'always',
        thumbAriaLabel: (i: number) => (i === 0 ? 'Min' : 'Max'),
      },
    })
    const tooltips = container.querySelectorAll('[data-slot="slider-tooltip"]')
    expect(tooltips).toHaveLength(2)
    expect(tooltips[0]?.textContent).toBe('10')
    expect(tooltips[1]?.textContent).toBe('90')
  })

  it('shows the tooltip on hover when tooltipVisibility="auto" (default)', async () => {
    const user = userEvent.setup()
    const { container } = render(Slider, { props: { defaultValue: 50, thumbAriaLabel: 'Volume' } })
    expect(container.querySelector('[data-slot="slider-tooltip"]')).toBeNull()

    const thumbWrapper = container.querySelector('[data-slot="slider-thumb"]') as HTMLElement
    expect(thumbWrapper).not.toBeNull()
    await user.hover(thumbWrapper)
    expect(container.querySelector('[data-slot="slider-tooltip"]')).not.toBeNull()
  })

  it('forwards class to the root', () => {
    const { container } = render(Slider, {
      props: { class: 'custom-slider', defaultValue: 50, thumbAriaLabel: 'Volume' },
    })
    expect(container.querySelector('[data-slot="slider"]')?.className).toContain('custom-slider')
  })

  it('has no accessibility violations (single thumb)', async () => {
    const { container } = render(Slider, { props: { defaultValue: 50, thumbAriaLabel: 'Volume' } })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations (range)', async () => {
    const { container } = render(Slider, {
      props: { defaultValue: [20, 80], thumbAriaLabel: (i: number) => (i === 0 ? 'Min' : 'Max') },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
