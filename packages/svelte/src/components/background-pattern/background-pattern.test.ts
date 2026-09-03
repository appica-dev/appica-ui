import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { htmlSnippet, textSnippet } from '../../test/snippet'
import BackgroundPattern from './background-pattern.svelte'

describe('BackgroundPattern', () => {
  it('renders its children inside a labeled wrapper', () => {
    render(BackgroundPattern, { props: { children: textSnippet('Content') } })
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Content').closest('[data-slot="background-pattern"]')).not.toBeNull()
  })

  it('paints a single decorative pattern layer when static', () => {
    const { container } = render(BackgroundPattern, { props: { variant: 'grid' } })
    const layers = container.querySelectorAll('[data-slot="background-pattern-layer"]')
    expect(layers).toHaveLength(1)
    layers.forEach((layer) => expect(layer).toHaveAttribute('aria-hidden', 'true'))
    expect(container.querySelector('[data-slot="background-pattern-highlight"]')).toBeNull()
  })

  it('mounts a cursor-following highlight when spotlight is enabled', () => {
    const { container } = render(BackgroundPattern, { props: { spotlight: true } })
    const highlight = container.querySelector('[data-slot="background-pattern-highlight"]')
    expect(highlight).not.toBeNull()
    expect(highlight).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelectorAll('[data-slot="background-pattern-layer"]')).toHaveLength(2)
  })

  it('marks the highlight persistent only when requested', () => {
    const { container, rerender } = render(BackgroundPattern, { props: { spotlight: true } })
    expect(container.querySelector('[data-slot="background-pattern-highlight"]')).not.toHaveAttribute('data-persistent')

    rerender({ spotlight: { persistent: true } })
    expect(container.querySelector('[data-slot="background-pattern-highlight"]')).toHaveAttribute('data-persistent')
  })

  it('treats the highlight as persistent under prefers-reduced-motion', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList) as typeof window.matchMedia

    try {
      const { container } = render(BackgroundPattern, { props: { spotlight: true } })
      expect(container.querySelector('[data-slot="background-pattern-highlight"]')).toHaveAttribute('data-persistent')
    } finally {
      window.matchMedia = original
    }
  })

  it('resolves the spotlight size from a number, string, or object', () => {
    const { container, rerender } = render(BackgroundPattern, { props: { spotlight: 300 } })
    const root = () => container.querySelector('[data-slot="background-pattern"]') as HTMLElement
    expect(root().style.getPropertyValue('--spotlight-size')).toBe('300px')

    rerender({ spotlight: '10rem' })
    expect(root().style.getPropertyValue('--spotlight-size')).toBe('10rem')

    rerender({ spotlight: { size: 18, persistent: true } })
    expect(root().style.getPropertyValue('--spotlight-size')).toBe('18px')
  })

  it('merges a consumer class over the default surface', () => {
    const { container } = render(BackgroundPattern, { props: { class: 'bg-white' } })
    const root = container.querySelector('[data-slot="background-pattern"]')!
    expect(root).toHaveClass('bg-white')
  })

  it('forwards cellSize as a CSS variable', () => {
    const { container } = render(BackgroundPattern, { props: { cellSize: 20 } })
    const root = container.querySelector('[data-slot="background-pattern"]') as HTMLElement
    expect(root.style.getPropertyValue('--pattern-cell')).toBe('20px')
  })

  it('has no accessibility violations (decorative layers are hidden)', async () => {
    const { container } = render(BackgroundPattern, {
      props: { spotlight: true, children: htmlSnippet('<p>Readable content</p>') },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
