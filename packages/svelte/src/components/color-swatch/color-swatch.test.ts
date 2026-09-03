import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { htmlSnippet } from '../../test/snippet'
import { parseColor } from '../../lib/color'
import ColorSwatch from './color-swatch.svelte'
import ColorSwatchHost from './color-swatch.test-host.svelte'

function renderSwatch(props: Record<string, unknown> = {}) {
  return render(ColorSwatch, { props: { 'data-testid': 'swatch', ...props } })
}

const swatch = () => screen.getByTestId('swatch')

describe('ColorSwatch', () => {
  it('paints an opaque color as a flat fill, with no checkerboard behind it', () => {
    renderSwatch({ color: '#3b82f6' })
    expect(swatch().style.backgroundColor).toBe('rgb(59, 130, 246)')
    expect(swatch().style.backgroundImage).toBe('')
  })

  it('accepts a Color object as well as a string', () => {
    renderSwatch({ color: parseColor('hsl(217, 91%, 60%)') })
    expect(swatch().style.backgroundColor).toBe('rgb(60, 131, 246)')
  })

  it('draws a translucent color over a checkerboard so the transparency reads', () => {
    renderSwatch({ color: 'rgba(59, 130, 246, 0.5)' })
    expect(swatch().style.backgroundImage).toContain('linear-gradient(rgba(59, 130, 246, 0.5)')
    expect(swatch().style.backgroundImage).toContain('repeating-conic-gradient')
    expect(swatch().style.backgroundSize).toBe('auto, 0.3em 0.3em')
  })

  it('drops the checkerboard so a translucent color can blend into the surface', () => {
    renderSwatch({ color: 'rgba(59, 130, 246, 0.5)', checkerboard: false })
    expect(swatch().style.backgroundImage).toBe('')
    expect(swatch().style.backgroundColor).toBe('rgba(59, 130, 246, 0.5)')
  })

  it('names the color for assistive technology', () => {
    renderSwatch({ color: '#3b82f6' })
    expect(screen.getByRole('img')).toHaveAccessibleName('vivid blue')
  })

  it('describes grays and the extremes without reaching for a hue', () => {
    const { unmount } = renderSwatch({ color: '#000000' })
    expect(swatch()).toHaveAccessibleName('black')
    unmount()

    const white = renderSwatch({ color: '#ffffff' })
    expect(swatch()).toHaveAccessibleName('white')
    white.unmount()

    const gray = renderSwatch({ color: '#808080' })
    expect(swatch()).toHaveAccessibleName('gray')
    gray.unmount()

    renderSwatch({ color: 'rgba(0, 0, 0, 0)' })
    expect(swatch()).toHaveAccessibleName('transparent')
  })

  it('reports the opacity as part of the name', () => {
    renderSwatch({ color: 'rgba(59, 130, 246, 0.5)' })
    expect(swatch()).toHaveAccessibleName('vivid blue, 50% opacity')
  })

  it('lets colorName replace the description and aria-label add context', () => {
    renderSwatch({ color: '#ff0000', colorName: 'Fire truck red', 'aria-label': 'Background color' })
    expect(swatch()).toHaveAccessibleName('Fire truck red, Background color')
  })

  it('sizes from a preset or an exact pixel number', () => {
    const { unmount } = renderSwatch({ color: '#3b82f6' })
    expect(swatch()).toHaveClass('text-[2.5rem]')
    expect(swatch()).toHaveClass('size-[1em]')
    unmount()

    renderSwatch({ color: '#3b82f6', size: 20 })
    expect(swatch().style.fontSize).toBe('20px')
    expect(swatch()).not.toHaveClass('text-[2.5rem]')
  })

  it('takes a size class override on the root', () => {
    renderSwatch({ color: '#3b82f6', class: 'size-10' })
    expect(swatch()).toHaveClass('size-10')
    expect(swatch()).not.toHaveClass('size-[1em]')
  })

  it('rounds the corners by default and goes fully round on request', () => {
    const { unmount } = renderSwatch({ color: '#3b82f6' })
    expect(swatch().className).toContain('rounded-[calc(tan(atan2(var(--radius-md),2.5rem))*100%)]')
    unmount()

    renderSwatch({ color: '#3b82f6', shape: 'circle' })
    expect(swatch()).toHaveClass('rounded-full')
  })

  it('drops the color when disabled, so the flat fill can show', () => {
    renderSwatch({ color: 'rgba(59, 130, 246, 0.5)', disabled: true })
    expect(swatch()).toHaveAttribute('data-disabled')
    expect(swatch().style.backgroundImage).toBe('')
    expect(swatch().style.backgroundColor).toBe('')
  })

  it('carries the shared border overlay', () => {
    renderSwatch({ color: '#3b82f6' })
    expect(swatch().querySelector('[data-slot="color-swatch-surface"]')).toBeInTheDocument()
  })

  it('renders children over the color', () => {
    renderSwatch({ color: '#3b82f6', children: htmlSnippet('<span data-testid="check">✓</span>') })
    expect(screen.getByTestId('check')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderSwatch({ color: 'rgba(59, 130, 246, 0.5)' })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('throws without a color when it is not inside a ColorPicker', () => {
    expect(() => render(ColorSwatch)).toThrow(/needs a `color`/)
  })

  it('previews the enclosing ColorPicker value when color is omitted', () => {
    render(ColorSwatchHost, { props: { defaultValue: '#ff0000' } })
    expect(swatch()).toHaveAccessibleName('vivid red')
  })

  it('dims with the enclosing ColorPicker when that picker is disabled', () => {
    render(ColorSwatchHost, { props: { disabled: true } })
    expect(swatch()).toHaveAttribute('data-disabled')
    expect(swatch().style.backgroundColor).toBe('')
  })
})
