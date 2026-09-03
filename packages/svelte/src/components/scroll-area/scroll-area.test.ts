import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import ScrollAreaHost from './scroll-area.test-host.svelte'

describe('ScrollArea', () => {
  it('renders viewport + content + a single vertical scrollbar by default', () => {
    const { container } = render(ScrollAreaHost)
    expect(container.querySelector('[data-slot="scroll-area"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="scroll-area-content"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="scroll-area-corner"]')).toBeNull()
  })

  it('pins content to the viewport width in the default vertical orientation', () => {
    const { container } = render(ScrollAreaHost)
    const content = container.querySelector('[data-slot="scroll-area-content"]') as HTMLElement
    expect(content.style.minWidth).toBe('0px')
  })

  it('keeps content sizing for horizontal orientations', () => {
    const { container } = render(ScrollAreaHost, { props: { orientation: 'horizontal' } })
    const content = container.querySelector('[data-slot="scroll-area-content"]') as HTMLElement
    expect(content.style.minWidth).toBe('fit-content')
  })

  it('does not apply mask classes when scrollShadow is omitted', () => {
    const { container } = render(ScrollAreaHost)
    const viewport = container.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
    expect(viewport.className).not.toContain('mask-intersect')
  })

  it('applies mask classes when scrollShadow is true', () => {
    const { container } = render(ScrollAreaHost, { props: { scrollShadow: true } })
    const viewport = container.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
    expect(viewport.className).toContain('mask-intersect')
    expect(viewport.className).toContain('mask-no-repeat')
    expect(viewport.className).toContain('mask-image:linear-gradient')
  })

  it('omits hover-reveal classes when scrollbarVisibility defaults to "always"', () => {
    const { container } = render(ScrollAreaHost)
    const scrollbar = container.querySelector('[data-slot="scroll-area-scrollbar"]') as HTMLElement | null
    if (scrollbar) {
      expect(scrollbar.getAttribute('data-visibility')).toBe('always')
      expect(scrollbar.className).not.toContain('opacity-0')
    }
  })

  it('applies auto-reveal classes when scrollbarVisibility="auto"', () => {
    const { container } = render(ScrollAreaHost, { props: { scrollbarVisibility: 'auto' } })
    const scrollbar = container.querySelector('[data-slot="scroll-area-scrollbar"]') as HTMLElement | null
    if (scrollbar) {
      expect(scrollbar.getAttribute('data-visibility')).toBe('auto')
      expect(scrollbar.className).toContain('opacity-0')
      expect(scrollbar.className).toContain('transition-[width,height,opacity]')
      expect(scrollbar.className).toContain('motion-reduce:transition-none')
      expect(scrollbar.className).toContain('data-[hovering]:opacity-100')
      expect(scrollbar.className).toContain('data-[scrolling]:opacity-100')
    }
  })

  it('does not render the scrollbar when scrollbarVisibility="never"', () => {
    const { container } = render(ScrollAreaHost, { props: { scrollbarVisibility: 'never', orientation: 'both' } })
    expect(container.querySelector('[data-slot="scroll-area-scrollbar"]')).toBeNull()
    expect(container.querySelector('[data-slot="scroll-area-corner"]')).toBeNull()
    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).not.toBeNull()
  })

  it('forwards class to the root element', () => {
    const { container } = render(ScrollAreaHost, { props: { class: 'custom-area h-40 w-80' } })
    const root = container.querySelector('[data-slot="scroll-area"]') as HTMLElement
    expect(root.className).toContain('custom-area')
    expect(root.className).toContain('relative')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(ScrollAreaHost, {
      props: { scrollShadow: true, scrollbarVisibility: 'auto', orientation: 'both' },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
