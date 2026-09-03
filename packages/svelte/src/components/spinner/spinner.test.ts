import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import Spinner from './spinner.svelte'
import { SPARKLE_MORPH_PATH } from './spinner-sparkle'

function stubReducedMotion() {
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
  return () => {
    window.matchMedia = original
  }
}

describe('Spinner', () => {
  it('exposes a status region with a default accessible name', () => {
    render(Spinner)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })

  it('forwards a custom aria-label', () => {
    render(Spinner, { props: { 'aria-label': 'Fetching results' } })
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Fetching results')
  })

  it('renders the status region as a <span> so it nests inside <p> without invalid HTML', () => {
    render(Spinner)
    expect(screen.getByRole('status').tagName).toBe('SPAN')
  })

  it.each(['circular', 'dots', 'sparkle'] as const)('renders the %s variant without throwing', (variant) => {
    render(Spinner, { props: { variant } })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('uses primary palette by default', () => {
    const { container } = render(Spinner)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('class')).toContain('text-primary')
  })

  it('switches to currentColor when the prop is set', () => {
    const { container } = render(Spinner, { props: { currentColor: true } })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('class')).toContain('text-current')
    expect(svg.getAttribute('class')).not.toContain('text-primary')
  })

  it('lets class override the default size via tailwind-merge', () => {
    render(Spinner, { props: { class: 'text-xl' } })
    const status = screen.getByRole('status')
    expect(status.className).toContain('text-xl')
    expect(status.className).not.toContain('text-[2.5rem]')
  })

  it('forwards arbitrary span props', () => {
    render(Spinner, { props: { 'data-testid': 'busy', id: 'spinner-1' } })
    const status = screen.getByTestId('busy')
    expect(status).toHaveAttribute('id', 'spinner-1')
  })

  it('holds a static circular frame under reduced motion', () => {
    const restore = stubReducedMotion()
    try {
      const { container } = render(Spinner)
      expect(container.querySelector('.appica-spinner-circular')).toBeNull()
    } finally {
      restore()
    }
  })

  it('holds a static dots frame under reduced motion', () => {
    const restore = stubReducedMotion()
    try {
      const { container } = render(Spinner, { props: { variant: 'dots' } })
      expect(container.querySelector('.appica-spinner-dot')).toBeNull()
      const ticks = container.querySelectorAll('rect')
      expect(ticks.length).toBe(12)
      for (const tick of ticks) {
        expect(tick.getAttribute('opacity')).toBe('0.25')
      }
    } finally {
      restore()
    }
  })

  it('holds a static sparkle path under reduced motion', () => {
    const restore = stubReducedMotion()
    try {
      const { container } = render(Spinner, { props: { variant: 'sparkle' } })
      const path = container.querySelector('path')!
      expect(path.getAttribute('d')).toBe(SPARKLE_MORPH_PATH)
      expect(path.getAttribute('style')).toBeNull()
    } finally {
      restore()
    }
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Spinner, { props: { 'aria-label': 'Loading' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
