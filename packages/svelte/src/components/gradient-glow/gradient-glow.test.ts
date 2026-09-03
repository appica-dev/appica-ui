import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { htmlSnippet, textSnippet } from '../../test/snippet'
import GradientGlow from './gradient-glow.svelte'

describe('GradientGlow', () => {
  it('renders its children inside a labeled wrapper', () => {
    render(GradientGlow, { props: { children: textSnippet('Content') } })
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Content').closest('[data-slot="gradient-glow"]')).not.toBeNull()
  })

  it('paints a decorative, blurred aura layer by default', () => {
    const { container } = render(GradientGlow)
    const aura = container.querySelector('[data-slot="gradient-glow-aura"]')!
    expect(aura).not.toBeNull()
    expect(aura).toHaveAttribute('aria-hidden', 'true')
    expect(aura).toHaveClass('blur-lg')
    expect(aura.getAttribute('style')).toContain('linear-gradient(')
  })

  it('omits the border ring unless requested', () => {
    const { container, rerender } = render(GradientGlow)
    expect(container.querySelector('[data-slot="gradient-glow-border"]')).toBeNull()

    rerender({ border: true })
    const ring = container.querySelector('[data-slot="gradient-glow-border"]')
    expect(ring).not.toBeNull()
    expect(ring).toHaveAttribute('aria-hidden', 'true')
  })

  it('maps the blur prop to a Tailwind utility', () => {
    const { container } = render(GradientGlow, { props: { blur: '2xl' } })
    const aura = container.querySelector('[data-slot="gradient-glow-aura"]')!
    expect(aura).toHaveClass('blur-2xl')
    expect(aura).not.toHaveClass('blur-lg')
  })

  it('reflects custom colors in the gradient', () => {
    const { container } = render(GradientGlow, { props: { from: '#112233', via: '#445566', to: '#778899' } })
    const style = container.querySelector('[data-slot="gradient-glow-aura"]')!.getAttribute('style') ?? ''
    expect(style).toContain('#112233')
    expect(style).toContain('#445566')
    expect(style).toContain('#778899')
  })

  it('marks managed visibility via data-reveal for interaction triggers', () => {
    const { container } = render(GradientGlow, { props: { revealOn: ['hover', 'press'] } })
    const root = container.querySelector('[data-slot="gradient-glow"]')!
    expect(root).toHaveAttribute('data-reveal', 'hover press')
    expect(root).not.toHaveAttribute('data-revealed')
  })

  it('groups and scales the layers on press when pressScale is set', () => {
    const { container } = render(GradientGlow, { props: { pressScale: true } })
    expect(container.querySelector('[data-slot="gradient-glow"]')).toHaveClass('group/glow')
    expect(container.querySelector('[data-slot="gradient-glow-aura"]')).toHaveClass('group-active/glow:scale-[0.97]')
  })

  it('opts into the touch fallback via data-show-on-touch', () => {
    const { container, rerender } = render(GradientGlow, { props: { revealOn: 'hover' } })
    const root = () => container.querySelector('[data-slot="gradient-glow"]') as HTMLElement
    expect(root()).not.toHaveAttribute('data-show-on-touch')

    rerender({ revealOn: 'hover', showOnTouch: true })
    expect(root()).toHaveAttribute('data-show-on-touch')
  })

  it('is always-on (no data-reveal) by default', () => {
    const { container } = render(GradientGlow)
    expect(container.querySelector('[data-slot="gradient-glow"]')).not.toHaveAttribute('data-reveal')
  })

  it('reflects the controlled reveal prop via data-revealed', () => {
    const { container, rerender } = render(GradientGlow, { props: { reveal: false } })
    const root = () => container.querySelector('[data-slot="gradient-glow"]') as HTMLElement
    expect(root()).toHaveAttribute('data-reveal', '')
    expect(root()).not.toHaveAttribute('data-revealed')

    rerender({ reveal: true })
    expect(root()).toHaveAttribute('data-revealed')
  })

  it('forwards the speed as an animation-duration variable', () => {
    const { container } = render(GradientGlow, { props: { speed: 10 } })
    const root = container.querySelector('[data-slot="gradient-glow"]') as HTMLElement
    expect(root.style.getPropertyValue('--gradient-glow-duration')).toBe('10s')
  })

  it('merges a consumer class onto the wrapper', () => {
    const { container } = render(GradientGlow, { props: { class: 'rounded-3xl' } })
    const root = container.querySelector('[data-slot="gradient-glow"]')!
    expect(root).toHaveClass('rounded-3xl')
    expect(root).not.toHaveClass('rounded-2xl')
  })

  it('has no accessibility violations (decorative layers are hidden)', async () => {
    const { container } = render(GradientGlow, {
      props: { border: true, children: htmlSnippet('<p>Readable content</p>') },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
