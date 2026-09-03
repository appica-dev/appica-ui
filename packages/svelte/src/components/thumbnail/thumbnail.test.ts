import { render, screen, waitFor } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { htmlSnippet } from '../../test/snippet'
import Thumbnail from './thumbnail.svelte'

const ROUNDED_RADIUS_CLASS = 'rounded-[calc(tan(atan2(var(--radius-md),2.5rem))*100%)]'

describe('Thumbnail', () => {
  it('renders the root with data-slot and default md size + rounded shape', () => {
    const { container } = render(Thumbnail, { props: { src: 'https://example.com/peak.jpg', alt: 'Mountain peak' } })

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root).not.toBeNull()
    expect(root.tagName).toBe('DIV')
    expect(root.className).toContain('size-[1em]')
    expect(root.className).toContain('text-[2.5rem]')
    expect(root.className).toContain(ROUNDED_RADIUS_CLASS)
    expect(root.className).toContain('overflow-hidden')
    expect(root.className).toContain('bg-background-muted')
  })

  it('applies the preset font-size class for each size', () => {
    const { container } = render(Thumbnail, {
      props: { size: 'lg', variant: 'icon-soft', children: htmlSnippet('<svg data-testid="icon"></svg>') },
    })

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.className).toContain('text-[3rem]')
  })

  it('uses rounded-full when shape="circle"', () => {
    const { container } = render(Thumbnail, {
      props: { shape: 'circle', src: 'https://example.com/peak.jpg', alt: 'Peak' },
    })

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.className).toContain('rounded-full')
    expect(root.className).not.toContain(ROUNDED_RADIUS_CLASS)
  })

  it('drives numeric size via inline font-size and skips the preset text class', () => {
    const { container } = render(Thumbnail, { props: { size: 56, src: 'https://example.com/peak.jpg', alt: 'Peak' } })

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.style.fontSize).toBe('56px')
    expect(root.className).toContain('size-[1em]')
    expect(root.className).not.toContain('text-[2.5rem]')
  })

  it('lets a caller-provided style override the numeric font-size', () => {
    const { container } = render(Thumbnail, { props: { size: 56, style: 'font-size: 80px', variant: 'icon-soft' } })

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.style.fontSize).toBe('80px')
  })

  it('renders an <img> with src/alt for the image variant', () => {
    const { container } = render(Thumbnail, { props: { src: 'https://example.com/peak.jpg', alt: 'Mountain peak' } })

    const img = container.querySelector('[data-slot="thumbnail-image"]') as HTMLImageElement
    expect(img.tagName).toBe('IMG')
    expect(img.getAttribute('src')).toBe('https://example.com/peak.jpg')
    expect(img.getAttribute('alt')).toBe('Mountain peak')
    expect(img.className).toContain('object-cover')
    expect(img.className).toContain('rounded-[inherit]')
  })

  it('shows the fallback icon when the image errors', async () => {
    const { container } = render(Thumbnail, { props: { src: 'https://example.com/broken.jpg', alt: 'Broken' } })

    const img = container.querySelector('[data-slot="thumbnail-image"]') as HTMLImageElement
    img.dispatchEvent(new Event('error'))

    const fallback = await waitFor(() => {
      const el = container.querySelector('[data-slot="thumbnail-fallback"]')
      if (!el) throw new Error('thumbnail-fallback not mounted')
      return el as HTMLElement
    })
    expect(fallback.querySelector('[data-slot="thumbnail-fallback-icon"]')).not.toBeNull()
  })

  it('renders icon children for the icon-soft variant', () => {
    const { container } = render(Thumbnail, {
      props: { variant: 'icon-soft', children: htmlSnippet('<svg data-testid="icon"></svg>') },
    })

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.tagName).toBe('DIV')
    expect(root.className).toContain('bg-background-muted')
    expect(root.className).toContain('text-foreground-intense')
    expect(screen.getByTestId('icon')).toBeTruthy()
    expect(container.querySelector('[data-slot="thumbnail-image"]')).toBeNull()
    expect(container.querySelector('[data-slot="thumbnail-fallback"]')).toBeNull()
  })

  it('applies the icon-primary variant classes', () => {
    const { container } = render(Thumbnail, {
      props: { variant: 'icon-primary', children: htmlSnippet('<svg></svg>') },
    })

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.className).toContain('bg-primary')
    expect(root.className).toContain('text-primary-foreground')
  })

  it('applies the icon-error variant classes', () => {
    const { container } = render(Thumbnail, {
      props: { variant: 'icon-error', children: htmlSnippet('<svg></svg>') },
    })

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.className).toContain('bg-error-muted')
    expect(root.className).toContain('text-error-foreground')
  })

  it('forwards class on the root', () => {
    const { container } = render(Thumbnail, { props: { class: 'my-thumb', variant: 'icon-soft' } })

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.className).toContain('my-thumb')
  })

  it('forwards arbitrary HTML attributes to the root', () => {
    render(Thumbnail, {
      props: {
        variant: 'icon-soft',
        'data-testid': 'root',
        'aria-label': 'Preview',
        children: htmlSnippet('<svg></svg>'),
      },
    })
    const root = screen.getByTestId('root')
    expect(root.getAttribute('aria-label')).toBe('Preview')
  })

  it('has no accessibility violations for the image variant', async () => {
    const { container } = render(Thumbnail, { props: { src: 'https://example.com/peak.jpg', alt: 'Mountain peak' } })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations for an icon variant', async () => {
    const { container } = render(Thumbnail, {
      props: { variant: 'icon-primary', children: htmlSnippet('<svg aria-hidden="true"></svg>') },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
