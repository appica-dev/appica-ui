import { render, screen, waitFor } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Thumbnail } from './thumbnail'

// jsdom does not actually load images. Base UI Avatar uses a pre-loader that
// listens for `load`/`error` on a probe Image - without this stub the probe
// never resolves and the underlying <img> never mounts.
const ORIGINAL_SRC_DESCRIPTOR = Object.getOwnPropertyDescriptor(window.Image.prototype, 'src')
beforeAll(() => {
  Object.defineProperty(window.Image.prototype, 'src', {
    configurable: true,
    set(value: string) {
      this.setAttribute('src', value)
      queueMicrotask(() => {
        if (value.includes('broken')) {
          this.dispatchEvent(new Event('error'))
          this.onerror?.(new Event('error') as Event)
        } else {
          this.dispatchEvent(new Event('load'))
          this.onload?.(new Event('load') as Event)
        }
      })
    },
    get() {
      return this.getAttribute('src') ?? ''
    },
  })
})
afterAll(() => {
  if (ORIGINAL_SRC_DESCRIPTOR) {
    Object.defineProperty(window.Image.prototype, 'src', ORIGINAL_SRC_DESCRIPTOR)
  }
})

const ROUNDED_RADIUS_CLASS = 'rounded-[calc(tan(atan2(var(--radius-md),2.5rem))*100%)]'

describe('Thumbnail', () => {
  it('renders the root with data-slot and default md size + rounded shape', () => {
    const { container } = render(<Thumbnail src="https://example.com/peak.jpg" alt="Mountain peak" />)

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
    const { container } = render(
      <Thumbnail size="lg" variant="icon-soft">
        <svg data-testid="icon" />
      </Thumbnail>,
    )

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.className).toContain('text-[3rem]')
  })

  it('uses rounded-full when shape="circle"', () => {
    const { container } = render(<Thumbnail shape="circle" src="https://example.com/peak.jpg" alt="Peak" />)

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.className).toContain('rounded-full')
    expect(root.className).not.toContain(ROUNDED_RADIUS_CLASS)
  })

  it('drives numeric size via inline font-size and skips the preset text class', () => {
    const { container } = render(<Thumbnail size={56} src="https://example.com/peak.jpg" alt="Peak" />)

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.style.fontSize).toBe('56px')
    expect(root.className).toContain('size-[1em]')
    expect(root.className).not.toContain('text-[2.5rem]')
  })

  it('lets a caller-provided style override the numeric font-size', () => {
    const { container } = render(<Thumbnail size={56} style={{ fontSize: '80px' }} variant="icon-soft" />)

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.style.fontSize).toBe('80px')
  })

  it('renders an <img> with src/alt for the image variant', async () => {
    const { container } = render(<Thumbnail src="https://example.com/peak.jpg" alt="Mountain peak" />)

    const img = await waitFor(() => {
      const el = container.querySelector('[data-slot="thumbnail-image"]') as HTMLImageElement | null
      if (!el) throw new Error('thumbnail-image not mounted')
      return el
    })
    expect(img.tagName).toBe('IMG')
    expect(img.getAttribute('src')).toBe('https://example.com/peak.jpg')
    expect(img.getAttribute('alt')).toBe('Mountain peak')
    expect(img.className).toContain('object-cover')
    expect(img.className).toContain('rounded-[inherit]')
  })

  it('shows the fallback icon when the image errors', async () => {
    const { container } = render(<Thumbnail src="https://example.com/broken.jpg" alt="Broken" />)

    const fallback = await waitFor(() => {
      const el = container.querySelector('[data-slot="thumbnail-fallback"]')
      if (!el) throw new Error('thumbnail-fallback not mounted')
      return el as HTMLElement
    })
    expect(fallback.querySelector('[data-slot="thumbnail-fallback-icon"]')).not.toBeNull()
  })

  it('fires onLoadingStatusChange when the image resolves', async () => {
    const handler = vi.fn()
    render(<Thumbnail src="https://example.com/peak.jpg" alt="Peak" onLoadingStatusChange={handler} />)

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith('loaded')
    })
  })

  it('lifts src/alt from a custom render element', async () => {
    render(<Thumbnail render={<img src="https://example.com/peak.jpg" alt="Peak" data-testid="lifted-img" />} />)

    const lifted = await screen.findByTestId('lifted-img')
    expect(lifted.getAttribute('src')).toBe('https://example.com/peak.jpg')
    expect(lifted.getAttribute('data-slot')).toBe('thumbnail-image')
  })

  it('mounts the image on the first render with keepMounted instead of preloading it', () => {
    const { container: preloaded } = render(<Thumbnail src="/peak.jpg" alt="Peak" />)
    expect(preloaded.querySelector('[data-slot="thumbnail-image"]')).toBeNull()

    const { container: inPlace } = render(<Thumbnail src="/peak.jpg" alt="Peak" keepMounted />)
    expect(inPlace.querySelector('[data-slot="thumbnail-image"]')).toHaveAttribute('src', '/peak.jpg')
  })

  it('swaps the underlying element via a render function', async () => {
    render(
      <Thumbnail
        src="https://example.com/peak.jpg"
        alt="Peak"
        render={(props) => <div data-testid="custom-image" {...props} />}
      />,
    )

    const custom = await screen.findByTestId('custom-image')
    expect(custom.tagName).toBe('DIV')
    expect(custom.getAttribute('data-slot')).toBe('thumbnail-image')
    expect(custom.className).toContain('object-cover')
    expect(custom.className).toContain('rounded-[inherit]')
  })

  it('renders icon children for the icon-soft variant', () => {
    const { container } = render(
      <Thumbnail variant="icon-soft">
        <svg data-testid="icon" />
      </Thumbnail>,
    )

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.tagName).toBe('DIV')
    expect(root.className).toContain('bg-background-muted')
    expect(root.className).toContain('text-foreground-intense')
    expect(screen.getByTestId('icon')).toBeTruthy()
    // icon variants must NOT mount image/fallback slots
    expect(container.querySelector('[data-slot="thumbnail-image"]')).toBeNull()
    expect(container.querySelector('[data-slot="thumbnail-fallback"]')).toBeNull()
  })

  it('applies the icon-primary variant classes', () => {
    const { container } = render(
      <Thumbnail variant="icon-primary">
        <svg />
      </Thumbnail>,
    )

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.className).toContain('bg-primary')
    expect(root.className).toContain('text-primary-foreground')
  })

  it('applies the icon-error variant classes', () => {
    const { container } = render(
      <Thumbnail variant="icon-error">
        <svg />
      </Thumbnail>,
    )

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.className).toContain('bg-error-muted')
    expect(root.className).toContain('text-error-foreground')
  })

  it('forwards className on the root', () => {
    const { container } = render(<Thumbnail className="my-thumb" variant="icon-soft" />)

    const root = container.querySelector('[data-slot="thumbnail"]') as HTMLElement
    expect(root.className).toContain('my-thumb')
  })

  it('forwards arbitrary HTML attributes to the root', () => {
    render(
      <Thumbnail variant="icon-soft" data-testid="root" aria-label="Preview">
        <svg />
      </Thumbnail>,
    )
    const root = screen.getByTestId('root')
    expect(root.getAttribute('aria-label')).toBe('Preview')
  })

  it('has no accessibility violations for the image variant', async () => {
    const { container } = render(<Thumbnail src="https://example.com/peak.jpg" alt="Mountain peak" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations for an icon variant', async () => {
    const { container } = render(
      <Thumbnail variant="icon-primary">
        <svg aria-hidden="true" />
      </Thumbnail>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
