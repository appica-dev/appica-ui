import { render, screen } from '@testing-library/svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { tick } from 'svelte'
import { textSnippet } from '../../test/snippet'
import TocLink from './toc-link.svelte'
import TocHost from './toc.test-host.svelte'

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  callback: IntersectionObserverCallback
  elements = new Set<Element>()
  root = null
  rootMargin = ''
  thresholds: number[] = []

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  observe = (element: Element) => {
    this.elements.add(element)
  }
  unobserve = (element: Element) => {
    this.elements.delete(element)
  }
  disconnect = () => {
    this.elements.clear()
  }
  takeRecords = () => []

  trigger(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver)
  }
}

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  MockIntersectionObserver.instances = []
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  vi.stubGlobal('ResizeObserver', MockResizeObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function lastObserver() {
  return MockIntersectionObserver.instances.at(-1)!
}

function entry(id: string, isIntersecting: boolean, rootBounds: Partial<DOMRectReadOnly> | null = null) {
  return {
    target: document.getElementById(id)!,
    isIntersecting,
    rootBounds: rootBounds as DOMRectReadOnly | null,
  }
}

describe('Toc', () => {
  it('renders a <nav> landmark with the default accessible name', () => {
    render(TocHost)
    const nav = screen.getByRole('navigation', { name: 'Table of contents' })
    expect(nav.tagName).toBe('NAV')
    expect(nav).toHaveAttribute('data-slot', 'toc')
  })

  it('accepts a custom aria-label', () => {
    render(TocHost, { props: { ariaLabel: 'On this page' } })
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument()
  })

  it('renders <ul>/<li>/<a> structure with data-slots', () => {
    render(TocHost)
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('data-slot', 'toc-list')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    for (const link of links) expect(link).toHaveAttribute('data-slot', 'toc-link')
  })

  it('observes the heading elements referenced by the links', async () => {
    render(TocHost)
    await tick()
    const observed = [...lastObserver().elements].map((element) => element.id)
    expect(observed).toEqual(['intro', 'usage', 'props'])
  })

  it('marks every link whose heading is in the viewport as active', async () => {
    render(TocHost)
    await tick()
    lastObserver().trigger([entry('intro', true), entry('usage', true), entry('props', false)])
    await tick()

    expect(screen.getByRole('link', { name: 'Intro' })).toHaveAttribute('data-active')
    expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute('data-active')
    expect(screen.getByRole('link', { name: 'Props' })).not.toHaveAttribute('data-active')
  })

  it('sets aria-current on the topmost active link and moves it as headings leave', async () => {
    render(TocHost)
    await tick()
    const observer = lastObserver()
    observer.trigger([entry('intro', true), entry('usage', true)])
    await tick()
    expect(screen.getByRole('link', { name: 'Intro' })).toHaveAttribute('aria-current', 'location')
    expect(screen.getByRole('link', { name: 'Usage' })).not.toHaveAttribute('aria-current')

    observer.trigger([entry('intro', false)])
    await tick()
    expect(screen.getByRole('link', { name: 'Intro' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute('aria-current', 'location')
  })

  it('falls back to the heading closest to the viewport top when none intersect', async () => {
    render(TocHost)
    await tick()
    const rect = (top: number) => ({ top }) as DOMRect
    vi.spyOn(document.getElementById('intro')!, 'getBoundingClientRect').mockReturnValue(rect(-300))
    vi.spyOn(document.getElementById('usage')!, 'getBoundingClientRect').mockReturnValue(rect(-10))
    vi.spyOn(document.getElementById('props')!, 'getBoundingClientRect').mockReturnValue(rect(500))

    lastObserver().trigger([entry('intro', false, { top: 0 })])
    await tick()

    expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute('data-active')
    expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute('aria-current', 'location')
    expect(screen.getByRole('link', { name: 'Intro' })).not.toHaveAttribute('data-active')
    expect(screen.getByRole('link', { name: 'Props' })).not.toHaveAttribute('data-active')
  })

  it('positions the indicator over the span of active links', async () => {
    render(TocHost)
    await tick()
    const links = screen.getAllByRole('link')
    Object.defineProperty(links[0], 'offsetTop', { value: 8 })
    Object.defineProperty(links[0], 'offsetHeight', { value: 24 })
    Object.defineProperty(links[1], 'offsetTop', { value: 40 })
    Object.defineProperty(links[1], 'offsetHeight', { value: 24 })

    lastObserver().trigger([entry('intro', true), entry('usage', true)])
    await tick()

    const list = screen.getByRole('list')
    expect(list.style.getPropertyValue('--toc-indicator-top')).toBe('8px')
    expect(list.style.getPropertyValue('--toc-indicator-height')).toBe('56px')
  })

  it('throws when a link is used outside Toc', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(TocLink, { props: { href: '#alone', children: textSnippet('Alone') } })).toThrow(
      /must be used within <Toc>/,
    )
    spy.mockRestore()
  })

  it('has no axe violations', async () => {
    const { container } = render(TocHost)
    await tick()
    lastObserver().trigger([entry('intro', true)])
    await tick()
    expect(await axe(container)).toHaveNoViolations()
  })
})
