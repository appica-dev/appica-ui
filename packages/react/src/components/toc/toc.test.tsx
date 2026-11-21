import { act, render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Toc, TocList, TocItem, TocLink } from './toc'

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  callback: IntersectionObserverCallback
  elements = new Set<Element>()
  root = null
  rootMargin = ''
  thresholds = []

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
    act(() => {
      this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver)
    })
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

function renderToc(props?: React.ComponentProps<typeof Toc>) {
  return render(
    <>
      <main>
        <h2 id="intro">Intro</h2>
        <h2 id="usage">Usage</h2>
        <h3 id="props">Props</h3>
      </main>
      <Toc {...props}>
        <TocList>
          <TocItem>
            <TocLink href="#intro">Intro</TocLink>
          </TocItem>
          <TocItem>
            <TocLink href="#usage">Usage</TocLink>
          </TocItem>
          <TocItem>
            <TocLink href="#props" depth={3}>
              Props
            </TocLink>
          </TocItem>
        </TocList>
      </Toc>
    </>,
  )
}

describe('Toc', () => {
  it('renders a <nav> landmark with the default accessible name', () => {
    renderToc()
    const nav = screen.getByRole('navigation', { name: 'Table of contents' })
    expect(nav.tagName).toBe('NAV')
    expect(nav).toHaveAttribute('data-slot', 'toc')
  })

  it('accepts a custom aria-label', () => {
    renderToc({ 'aria-label': 'On this page' })
    expect(screen.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument()
  })

  it('renders <ul>/<li>/<a> structure with data-slots', () => {
    renderToc()
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('data-slot', 'toc-list')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    for (const link of links) expect(link).toHaveAttribute('data-slot', 'toc-link')
  })

  it('observes the heading elements referenced by the links', () => {
    renderToc()
    const observed = [...lastObserver().elements].map((element) => element.id)
    expect(observed).toEqual(['intro', 'usage', 'props'])
  })

  it('marks every link whose heading is in the viewport as active', () => {
    renderToc()
    lastObserver().trigger([entry('intro', true), entry('usage', true), entry('props', false)])

    expect(screen.getByRole('link', { name: 'Intro' })).toHaveAttribute('data-active')
    expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute('data-active')
    expect(screen.getByRole('link', { name: 'Props' })).not.toHaveAttribute('data-active')
  })

  it('sets aria-current on the topmost active link and moves it as headings leave', () => {
    renderToc()
    const observer = lastObserver()
    observer.trigger([entry('intro', true), entry('usage', true)])
    expect(screen.getByRole('link', { name: 'Intro' })).toHaveAttribute('aria-current', 'location')
    expect(screen.getByRole('link', { name: 'Usage' })).not.toHaveAttribute('aria-current')

    observer.trigger([entry('intro', false)])
    expect(screen.getByRole('link', { name: 'Intro' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute('aria-current', 'location')
  })

  it('falls back to the heading closest to the viewport top when none intersect', () => {
    renderToc()
    const rect = (top: number) => ({ top }) as DOMRect
    vi.spyOn(document.getElementById('intro')!, 'getBoundingClientRect').mockReturnValue(rect(-300))
    vi.spyOn(document.getElementById('usage')!, 'getBoundingClientRect').mockReturnValue(rect(-10))
    vi.spyOn(document.getElementById('props')!, 'getBoundingClientRect').mockReturnValue(rect(500))

    lastObserver().trigger([entry('intro', false, { top: 0 })])

    expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute('data-active')
    expect(screen.getByRole('link', { name: 'Usage' })).toHaveAttribute('aria-current', 'location')
    expect(screen.getByRole('link', { name: 'Intro' })).not.toHaveAttribute('data-active')
    expect(screen.getByRole('link', { name: 'Props' })).not.toHaveAttribute('data-active')
  })

  it('positions the indicator over the span of active links', () => {
    renderToc()
    const links = screen.getAllByRole('link')
    Object.defineProperty(links[0], 'offsetTop', { value: 8 })
    Object.defineProperty(links[0], 'offsetHeight', { value: 24 })
    Object.defineProperty(links[1], 'offsetTop', { value: 40 })
    Object.defineProperty(links[1], 'offsetHeight', { value: 24 })

    lastObserver().trigger([entry('intro', true), entry('usage', true)])

    const list = screen.getByRole('list')
    expect(list.style.getPropertyValue('--toc-indicator-top')).toBe('8px')
    expect(list.style.getPropertyValue('--toc-indicator-height')).toBe('56px')
  })

  it('tracks the same links with highlight on, without passing the prop to the DOM', async () => {
    const { container } = renderToc({ highlight: true })
    const links = screen.getAllByRole('link')
    Object.defineProperty(links[0], 'offsetTop', { value: 8 })
    Object.defineProperty(links[0], 'offsetHeight', { value: 24 })

    lastObserver().trigger([entry('intro', true)])

    expect(screen.getByRole('navigation')).not.toHaveAttribute('highlight')
    expect(links[0]).toHaveAttribute('data-active')
    expect(links[0]).toHaveAttribute('aria-current', 'location')
    expect(screen.getByRole('list').style.getPropertyValue('--toc-indicator-height')).toBe('24px')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('supports the render prop on TocLink', () => {
    render(
      <>
        <h2 id="alone">Alone</h2>
        <Toc>
          <TocList>
            <TocItem>
              <TocLink href="#alone" render={<a data-testid="custom-link" />}>
                Alone
              </TocLink>
            </TocItem>
          </TocList>
        </Toc>
      </>,
    )
    expect(screen.getByTestId('custom-link')).toHaveAttribute('href', '#alone')
    expect([...lastObserver().elements].map((element) => element.id)).toEqual(['alone'])
  })

  it('has no axe violations', async () => {
    const { container } = renderToc()
    lastObserver().trigger([entry('intro', true)])
    expect(await axe(container)).toHaveNoViolations()
  })
})
