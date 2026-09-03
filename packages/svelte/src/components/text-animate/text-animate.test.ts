import { render, screen } from '@testing-library/svelte'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { axe } from 'vitest-axe'
import { tick } from 'svelte'
import TextAnimate from './text-animate.svelte'
import TextAnimateHost from './text-animate.test-host.svelte'
import type { TextAnimateUnitContext } from './text-animate-model'

afterEach(() => {
  vi.useRealTimers()
})

describe('TextAnimate', () => {
  it('always exposes the full text to assistive tech via an sr-only copy', () => {
    render(TextAnimate, { props: { text: 'Hello world', autoPlay: false, progress: 0 } })
    expect(screen.getByText('Hello world')).toHaveClass('sr-only')
  })

  it('splits into per-character units at full progress', () => {
    const { container } = render(TextAnimate, { props: { text: 'abc', effect: 'flip', progress: 1 } })
    const units = container.querySelectorAll('[data-slot="text-animate-unit"]')
    expect(units).toHaveLength(3)
    expect(Array.from(units, (u) => u.textContent).join('')).toBe('abc')
  })

  it('splits by word when the effect/level calls for it', () => {
    const { container } = render(TextAnimate, {
      props: { text: 'one two three', by: 'word', effect: 'highlight', progress: 1 },
    })
    const units = container.querySelectorAll('[data-slot="text-animate-unit"]')
    expect(units).toHaveLength(3)
    expect(units[0]).toHaveTextContent('one')
    expect(units[2]).toHaveTextContent('three')
  })

  it('sweeps the shimmer glare across the whole string and returns to the same frame at both ends of the loop', () => {
    const { container, rerender } = render(TextAnimate, { props: { text: 'Generating response', effect: 'shimmer', progress: 0 } })
    const visual = () => container.querySelector('[aria-hidden="true"]') as HTMLElement

    expect(visual().style.backgroundClip).toBe('text')
    expect(visual().style.backgroundImage).toContain('linear-gradient')
    expect(visual().style.backgroundPosition).toBe('100% 0px')

    rerender({ text: 'Generating response', effect: 'shimmer', progress: 0.5 })
    expect(visual().style.backgroundPosition).toBe('50% 0px')

    rerender({ text: 'Generating response', effect: 'shimmer', progress: 1 })
    expect(visual().style.backgroundPosition).toBe('0% 0px')
  })

  it('keeps the shimmer glare identical however the text is split, so `by` stays orthogonal', () => {
    const positions = (['line', 'word', 'char'] as const).map((by) => {
      const { container, unmount } = render(TextAnimate, {
        props: { text: 'Generating a response', effect: 'shimmer', by, progress: 0.4 },
      })
      const visual = container.querySelector('[aria-hidden="true"]') as HTMLElement
      const units = container.querySelectorAll('[data-slot="text-animate-unit"]').length
      const result = { by, units, position: visual.style.backgroundPosition, image: visual.style.backgroundImage }
      unmount()
      return result
    })

    expect(positions.map((p) => p.units)).toEqual([1, 3, 19])
    expect(new Set(positions.map((p) => p.position)).size).toBe(1)
    expect(new Set(positions.map((p) => p.image)).size).toBe(1)
  })

  it('drops the shimmer gradient under reduced motion so the text keeps its own color', () => {
    const { container } = render(TextAnimateHost, {
      props: { text: 'Generating response', effect: 'shimmer', reduced: true },
    })
    const visual = container.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(visual.style.backgroundImage).toBe('')
    expect(visual.style.webkitTextFillColor).toBe('')
    expect(visual).toHaveTextContent('Generating response')
  })

  it('drives the animation from a controlled progress value', () => {
    const { container, rerender } = render(TextAnimate, { props: { text: 'Hi', effect: 'typewriter', progress: 0 } })
    const visual = container.querySelector('[aria-hidden="true"]')!
    expect(visual.textContent).toBe('')

    rerender({ text: 'Hi', effect: 'typewriter', progress: 1 })
    expect(visual.textContent).toContain('Hi')
  })

  it('passes a custom effect function the local progress and unit context', () => {
    const effect = vi.fn((_p: number, _ctx: TextAnimateUnitContext) => ({ style: { opacity: String(_p) } }))
    render(TextAnimate, { props: { text: 'ab', effect, by: 'char', stagger: 0, progress: 0.5 } })
    expect(effect).toHaveBeenCalled()
    const [, ctx] = effect.mock.calls[0]!
    expect(ctx).toMatchObject({ total: 2, by: 'char', globalProgress: 0.5 })
  })

  it('advances the built-in clock with requestAnimationFrame to reveal text over time', async () => {
    let t = 0
    vi.spyOn(performance, 'now').mockImplementation(() => t)
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      t += 700
      return setTimeout(() => cb(t), 0) as unknown as number
    })

    const { container } = render(TextAnimate, { props: { text: 'Hi', effect: 'typewriter', duration: 1 } })
    const visual = container.querySelector('[aria-hidden="true"]')!
    expect(visual.textContent).toBe('')

    for (let i = 0; i < 6; i++) {
      await tick()
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
    expect(visual.textContent).toContain('Hi')

    rafSpy.mockRestore()
  })

  it('renders the final, fully-revealed frame under reduced motion', () => {
    const { container } = render(TextAnimateHost, {
      props: { text: 'Hello', effect: 'typewriter', duration: 5, reduced: true },
    })
    const visual = container.querySelector('[aria-hidden="true"]')!
    expect(visual.textContent).toContain('Hello')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(TextAnimate, {
      props: { text: 'Accessible animated text', effect: 'highlight', progress: 1 },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
