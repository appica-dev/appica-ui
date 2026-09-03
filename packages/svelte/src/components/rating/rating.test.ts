import { fireEvent, render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { tick } from 'svelte'
import Rating from './rating.svelte'
import RatingHost from './rating.test-host.svelte'
import RatingControlledHost from './rating.controlled-host.svelte'

describe('Rating', () => {
  it('renders a radiogroup with one radio per item', () => {
    render(Rating, { props: { 'aria-label': 'Rating' } })
    expect(screen.getByRole('radiogroup', { name: 'Rating' })).toHaveAttribute('data-slot', 'rating')
    expect(screen.getAllByRole('radio')).toHaveLength(5)
  })

  it('honors count and marks the item holding the value as checked', () => {
    render(Rating, { props: { 'aria-label': 'Rating', count: 3, defaultValue: 2 } })
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
    expect(radios[1]).toBeChecked()
    expect(radios[0]).not.toBeChecked()
  })

  it('selects on click and reports the new value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(Rating, { props: { 'aria-label': 'Rating', onValueChange } })

    await user.click(screen.getAllByRole('radio')[3])

    expect(onValueChange).toHaveBeenCalledWith(4)
    expect(screen.getAllByRole('radio')[3]).toBeChecked()
  })

  it('stays on the controlled value until the consumer updates it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(RatingControlledHost, { props: { onValueChange, locked: 2 } })

    await user.click(screen.getAllByRole('radio')[4])

    expect(onValueChange).toHaveBeenCalledWith(5)
    expect(screen.getAllByRole('radio')[1]).toBeChecked()
    expect(screen.getAllByRole('radio')[4]).not.toBeChecked()
  })

  it('clears the rating when clearable and the current item is picked again', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(Rating, { props: { 'aria-label': 'Rating', defaultValue: 3, clearable: true, onValueChange } })

    await user.click(screen.getAllByRole('radio')[2])

    expect(onValueChange).toHaveBeenCalledWith(0)
    expect(screen.getAllByRole('radio').some((radio) => radio.getAttribute('aria-checked') === 'true')).toBe(false)
  })

  it('moves the value by step with the arrow keys', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(Rating, { props: { 'aria-label': 'Rating', defaultValue: 2, step: 0.5, onValueChange } })

    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(onValueChange).toHaveBeenLastCalledWith(2.5)

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(onValueChange).toHaveBeenLastCalledWith(1.5)

    await user.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith(5)

    await user.keyboard('{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith(0.5)
  })

  it('flips the horizontal arrow keys in RTL', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(RatingHost, { props: { defaultValue: 3, onValueChange, rtl: true } })

    await user.tab()
    await user.keyboard('{ArrowRight}')

    expect(onValueChange).toHaveBeenLastCalledWith(2)
  })

  it('steps to the next item with Down/Right and the previous with Up/Left', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(Rating, { props: { 'aria-label': 'Rating', defaultValue: 3, onValueChange } })

    await user.tab()
    await user.keyboard('{ArrowDown}')
    expect(onValueChange).toHaveBeenLastCalledWith(4)

    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(onValueChange).toHaveBeenLastCalledWith(2)
  })

  it('renders vertically and fills from the top', async () => {
    const onValueChange = vi.fn()
    const { container } = render(Rating, {
      props: { 'aria-label': 'Rating', count: 3, orientation: 'vertical', value: 2, onValueChange },
    })

    const root = screen.getByRole('radiogroup')
    expect(root).toHaveAttribute('data-orientation', 'vertical')
    expect(root).toHaveAttribute('aria-orientation', 'vertical')

    const clips = [...container.querySelectorAll<HTMLElement>('[data-slot="rating-item-fill"]')].map(
      (el) => el.style.clipPath,
    )
    expect(clips).toEqual(['inset(0 0 0% 0)', 'inset(0 0 0% 0)', 'inset(0 0 100% 0)'])

    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({ top: 0, height: 300 } as DOMRect)
    fireEvent.pointerMove(root, { clientY: 250 })
    fireEvent.click(screen.getAllByRole('radio')[2], { detail: 1 })
    expect(onValueChange).toHaveBeenCalledWith(3)
  })

  it('keeps a single tab stop on the checked item', async () => {
    const user = userEvent.setup()
    render(Rating, { props: { 'aria-label': 'Rating', defaultValue: 4 } })

    await user.tab()

    expect(screen.getAllByRole('radio')[3]).toHaveFocus()
  })

  it('exposes a read-only rating as one labeled image', () => {
    render(Rating, { props: { readOnly: true, value: 4.5, step: 0.5 } })
    expect(screen.getByRole('img', { name: '4.5 out of 5' })).toHaveAttribute('data-readonly', '')
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
  })

  it('blocks interaction when disabled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(Rating, { props: { 'aria-label': 'Rating', disabled: true, onValueChange } })

    await user.click(screen.getAllByRole('radio')[2])

    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-disabled', '')
  })

  it('submits the value through a hidden input', () => {
    const { container } = render(Rating, { props: { 'aria-label': 'Rating', name: 'score', defaultValue: 3 } })
    expect(container.querySelector('input[name="score"]')).toHaveValue('3')
  })

  it('renders the built-in star by default and swaps in a custom icon pair', () => {
    const { container } = render(Rating, { props: { 'aria-label': 'Rating', count: 1 } })
    expect(container.querySelectorAll('svg')).toHaveLength(2)

    const { container: custom } = render(RatingHost, { props: { count: 1, customIcon: true, variant: 'outline' } })
    expect(custom.querySelector('[data-testid="empty"]')).not.toBeNull()
    expect(custom.querySelector('[data-testid="filled"]')).not.toBeNull()
  })

  it('still fills the selection when the hover preview is off', async () => {
    const { container } = render(Rating, { props: { 'aria-label': 'Rating', count: 3, hoverable: false } })
    const root = screen.getByRole('radiogroup')
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 300 } as DOMRect)

    fireEvent.pointerMove(root, { clientX: 150 })
    fireEvent.click(screen.getAllByRole('radio')[1], { detail: 1 })
    await tick()

    const clips = [...container.querySelectorAll<HTMLElement>('[data-slot="rating-item-fill"]')].map(
      (el) => el.style.clipPath,
    )
    expect(clips).toEqual(['inset(0 0% 0 0)', 'inset(0 0% 0 0)', 'inset(0 100% 0 0)'])
  })

  it('holds the pressed item scaled down until the pointer is released', async () => {
    const { container } = render(Rating, { props: { 'aria-label': 'Rating', count: 3 } })
    const icon = () => container.querySelectorAll<HTMLElement>('[data-slot="rating-item"] > span')[1]!

    fireEvent.pointerDown(screen.getAllByRole('radio')[1])
    await tick()
    expect(icon().className).toContain('scale-90')

    fireEvent.pointerUp(screen.getAllByRole('radio')[1])
    await tick()
    expect(icon().className).not.toContain('scale-90')
  })

  it('presses an item even while another one holds focus', async () => {
    const { container } = render(Rating, { props: { 'aria-label': 'Rating', count: 3 } })
    const radios = screen.getAllByRole('radio')
    const icon = () => container.querySelectorAll<HTMLElement>('[data-slot="rating-item"] > span')[0]!

    radios[2].focus()
    fireEvent.pointerDown(radios[0])
    fireEvent.blur(radios[2])
    await tick()

    expect(icon().className).toContain('scale-90')
  })

  it('clips each item fill to the value it holds', () => {
    const { container } = render(Rating, { props: { 'aria-label': 'Rating', value: 2.4, step: 0.2, count: 3 } })
    const clips = [...container.querySelectorAll<HTMLElement>('[data-slot="rating-item-fill"]')].map(
      (el) => el.style.clipPath,
    )
    expect(clips).toEqual(['inset(0 0% 0 0)', 'inset(0 0% 0 0)', 'inset(0 60% 0 0)'])
  })

  it('sizes the icons from a number of pixels or any CSS length', () => {
    const { container, rerender } = render(Rating, { props: { 'aria-label': 'Rating' } })
    const root = () => container.querySelector<HTMLElement>('[data-slot="rating"]')!

    expect(root().style.getPropertyValue('--rating-size')).toBe('24px')

    rerender({ 'aria-label': 'Rating', size: 40 })
    expect(root().style.getPropertyValue('--rating-size')).toBe('40px')

    rerender({ 'aria-label': 'Rating', size: '1.5em', style: 'opacity: 0.5' })
    expect(root().style.getPropertyValue('--rating-size')).toBe('1.5em')
    expect(root().style.opacity).toBe('0.5')
  })

  it('merges class with the layout classes', () => {
    render(Rating, { props: { 'aria-label': 'Rating', class: 'custom-class' } })
    const root = screen.getByRole('radiogroup')
    expect(root.className).toContain('custom-class')
    expect(root.className).toContain('inline-flex')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Rating, { props: { 'aria-label': 'Rating', defaultValue: 3 } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
