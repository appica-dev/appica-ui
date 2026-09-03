import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { htmlSnippet, textSnippet } from '../../test/snippet'
import BorderBeam from './border-beam.svelte'

const root = (container: HTMLElement) => container.querySelector('[data-slot="border-beam"]') as HTMLElement
const ring = (container: HTMLElement) => container.querySelector('[data-slot="border-beam-ring"]') as HTMLElement

describe('BorderBeam', () => {
  it('renders its children inside the wrapper', () => {
    render(BorderBeam, { props: { children: textSnippet('Content') } })
    expect(screen.getByText('Content').closest('[data-slot="border-beam"]')).not.toBeNull()
  })

  it('paints a decorative comet that fades into a transparent tail', () => {
    const { container } = render(BorderBeam)
    expect(ring(container)).toHaveAttribute('aria-hidden')
    expect(ring(container).getAttribute('style') ?? '').toContain(
      'conic-gradient(from var(--border-beam-angle), transparent',
    )
  })

  it('maps color and length onto the gradient, and thickness onto the ring', () => {
    const { container } = render(BorderBeam, { props: { color: '#8EC5FF', length: 25, thickness: 3 } })
    const style = ring(container).getAttribute('style') ?? ''
    expect(style).toContain('#8EC5FF 25%')
    expect(style).toContain('padding: 3px')
  })

  it('forwards speed and delay as CSS variables', () => {
    const { container } = render(BorderBeam, { props: { speed: 10, delay: -2 } })
    const style = root(container).style
    expect(style.getPropertyValue('--border-beam-duration')).toBe('10s')
    expect(style.getPropertyValue('--border-beam-delay')).toBe('-2s')
  })

  it('is always-on (no data-reveal) by default', () => {
    const { container } = render(BorderBeam)
    expect(root(container)).not.toHaveAttribute('data-reveal')
    expect(ring(container).className).not.toContain('opacity-0')
  })

  it('marks managed visibility via data-reveal for interaction triggers', () => {
    const { container } = render(BorderBeam, { props: { revealOn: ['hover', 'press'] } })
    expect(root(container)).toHaveAttribute('data-reveal', 'hover press')
    expect(root(container)).not.toHaveAttribute('data-revealed')
    expect(ring(container).className).toContain('opacity-0')
    expect(ring(container).className).toContain('[animation-play-state:paused]')
  })

  it('reflects the controlled reveal prop via data-revealed', () => {
    const { container, rerender } = render(BorderBeam, { props: { reveal: false } })
    expect(root(container)).toHaveAttribute('data-reveal', '')
    expect(root(container)).not.toHaveAttribute('data-revealed')

    rerender({ reveal: true })
    expect(root(container)).toHaveAttribute('data-revealed')
    expect(ring(container).className).toContain('opacity-100')
  })

  it('opts into the touch fallback via data-show-on-touch', () => {
    const { container, rerender } = render(BorderBeam, { props: { revealOn: 'hover' } })
    expect(root(container)).not.toHaveAttribute('data-show-on-touch')

    rerender({ revealOn: 'hover', showOnTouch: true })
    expect(root(container)).toHaveAttribute('data-show-on-touch')
  })

  it('groups and scales the ring on press when pressScale is set', () => {
    const { container } = render(BorderBeam, { props: { pressScale: true } })
    expect(root(container).className).toContain('group/beam')
    expect(ring(container).className).toContain('group-active/beam:scale-[0.97]')
  })

  it('merges a consumer class onto the wrapper', () => {
    const { container } = render(BorderBeam, { props: { class: 'rounded-full' } })
    expect(root(container).className).toContain('rounded-full')
    expect(root(container).className).not.toContain('rounded-xl')
  })

  it('has no accessibility violations (the beam is decorative)', async () => {
    const { container } = render(BorderBeam, { props: { children: htmlSnippet('<p>Readable content</p>') } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
