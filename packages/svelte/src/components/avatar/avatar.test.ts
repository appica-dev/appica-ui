import { tick } from 'svelte'
import { render, screen } from '@testing-library/svelte'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import AvatarGroupHost from './avatar-group.test-host.svelte'
import AvatarHost from './avatar.test-host.svelte'

const ROUNDED_RADIUS_CLASS = 'rounded-[calc(tan(atan2(var(--radius-md),2.5rem))*100%)]'

describe('Avatar', () => {
  it('renders a root with data-slot and default md size + circle shape', () => {
    const { container } = render(AvatarHost)

    const root = container.querySelector('[data-slot="avatar"]') as HTMLElement
    expect(root).not.toBeNull()
    expect(root.className).toContain('size-[1em]')
    expect(root.className).toContain('text-[2.5rem]')
    expect(root.className).toContain('rounded-full')
    expect(root.className).toContain('bg-background-strong')
    expect(root.className).toContain('relative')
  })

  it('applies the per-preset font-size class', () => {
    const { container } = render(AvatarHost, { props: { size: 'lg', shape: 'rounded' } })

    const root = container.querySelector('[data-slot="avatar"]') as HTMLElement
    expect(root.className).toContain('text-[3rem]')
    expect(root.className).toContain(ROUNDED_RADIUS_CLASS)
  })

  it('uses rounded-full when shape="circle"', () => {
    const { container } = render(AvatarHost, { props: { shape: 'circle', size: 'md' } })

    const root = container.querySelector('[data-slot="avatar"]') as HTMLElement
    expect(root.className).toContain('rounded-full')
    expect(root.className).not.toContain(ROUNDED_RADIUS_CLASS)
  })

  it('drives numeric size via inline font-size (no preset text class)', () => {
    const { container } = render(AvatarHost, { props: { size: 56, shape: 'rounded' } })

    const root = container.querySelector('[data-slot="avatar"]') as HTMLElement
    expect(root.style.fontSize).toBe('56px')
    expect(root.className).toContain('size-[1em]')
    expect(root.className).toContain(ROUNDED_RADIUS_CLASS)
    expect(root.className).not.toContain('text-[2.5rem]')
  })

  it('lets a caller-provided style override numeric defaults', () => {
    const { container } = render(AvatarHost, { props: { size: 56, style: 'font-size: 80px' } })

    const root = container.querySelector('[data-slot="avatar"]') as HTMLElement
    expect(root.style.fontSize).toBe('80px')
  })

  it('renders the fallback content when no image is provided', () => {
    render(AvatarHost)
    expect(screen.getByText('JD')).toBeTruthy()
  })

  it('shrinks textual fallback content to 0.4em', () => {
    const { container } = render(AvatarHost)

    const fb = container.querySelector('[data-slot="avatar-fallback"]') as HTMLElement
    expect(fb.className).toContain('text-[0.4em]')
    expect(fb.className).toContain('has-[svg]:text-[1em]')
  })

  it('renders AvatarImage as an <img> with src/alt and data-slot', () => {
    const { container } = render(AvatarHost, {
      props: { src: 'https://example.com/jane.jpg', alt: 'Jane Doe' },
    })

    const img = container.querySelector('[data-slot="avatar-image"]') as HTMLImageElement
    expect(img.tagName).toBe('IMG')
    expect(img.getAttribute('src')).toBe('https://example.com/jane.jpg')
    expect(img.getAttribute('alt')).toBe('Jane Doe')
    expect(img.className).toContain('object-cover')
    expect(img.className).toContain('rounded-[inherit]')
  })

  it('AvatarBadge renders a dot without ping span by default', () => {
    const { container } = render(AvatarHost, { props: { showBadge: true } })

    const badge = container.querySelector('[data-slot="avatar-badge"]') as HTMLElement
    expect(badge).not.toBeNull()
    expect(badge.className).toContain('size-[30%]')
    expect(badge.className).toContain('rounded-full')
    expect(badge.querySelectorAll('span').length).toBe(1)
    expect(badge.querySelector('.animate-ping-paced')).toBeNull()
  })

  it('AvatarBadge adds the ping span when animate is true', () => {
    const { container } = render(AvatarHost, { props: { showBadge: true, animateBadge: true } })

    const badge = container.querySelector('[data-slot="avatar-badge"]') as HTMLElement
    expect(badge.querySelector('.animate-ping-paced')).not.toBeNull()
  })

  it('AvatarBadge merges a caller class', () => {
    const { container } = render(AvatarHost, { props: { showBadge: true, badgeClass: 'text-error-emphasis' } })

    const badge = container.querySelector('[data-slot="avatar-badge"]') as HTMLElement
    expect(badge.className).toContain('text-error-emphasis')
  })

  it('forwards class on the Root', () => {
    const { container } = render(AvatarHost, { props: { class: 'my-avatar' } })

    const root = container.querySelector('[data-slot="avatar"]') as HTMLElement
    expect(root.className).toContain('my-avatar')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(AvatarHost, {
      props: { size: 'md', src: 'https://example.com/jane.jpg', alt: 'Jane Doe', showBadge: true, animateBadge: true },
    })

    expect(await axe(container)).toHaveNoViolations()
  })

  it('fires onLoadingStatusChange as the image loads and still calls consumer onload', async () => {
    const onLoadingStatusChange = vi.fn()
    const onload = vi.fn()
    const { container } = render(AvatarHost, {
      props: {
        src: 'https://example.com/jane.jpg',
        alt: 'Jane Doe',
        onLoadingStatusChange,
        onload,
      },
    })

    expect(onLoadingStatusChange).toHaveBeenCalledWith('loading')

    const img = container.querySelector('[data-slot="avatar-image"]') as HTMLImageElement
    img.dispatchEvent(new Event('load'))
    await tick()

    expect(onLoadingStatusChange).toHaveBeenCalledWith('loaded')
    expect(onload).toHaveBeenCalled()
    expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeNull()
  })

  it('keeps the fallback visible when a consumer onload is provided', () => {
    const onload = vi.fn()
    const { container } = render(AvatarHost, {
      props: { src: 'https://example.com/jane.jpg', alt: 'Jane Doe', onload },
    })

    expect(container.querySelector('[data-slot="avatar-fallback"]')).not.toBeNull()
    expect(onload).not.toHaveBeenCalled()
  })

  it('fires onLoadingStatusChange with error and still calls consumer onerror', async () => {
    const onLoadingStatusChange = vi.fn()
    const onerror = vi.fn()
    const { container } = render(AvatarHost, {
      props: {
        src: 'https://example.com/broken.jpg',
        alt: 'Broken',
        onLoadingStatusChange,
        onerror,
      },
    })

    const img = container.querySelector('[data-slot="avatar-image"]') as HTMLImageElement
    img.dispatchEvent(new Event('error'))
    await tick()

    expect(onLoadingStatusChange).toHaveBeenCalledWith('error')
    expect(onerror).toHaveBeenCalled()
    expect(container.querySelector('[data-slot="avatar-image"]')).toBeNull()
    expect(container.querySelector('[data-slot="avatar-fallback"]')).not.toBeNull()
  })

  it('resets to idle when src is cleared so the fallback returns', async () => {
    const onLoadingStatusChange = vi.fn()
    const { container, rerender } = render(AvatarHost, {
      props: {
        src: 'https://example.com/jane.jpg',
        alt: 'Jane Doe',
        onLoadingStatusChange,
      },
    })

    const img = container.querySelector('[data-slot="avatar-image"]') as HTMLImageElement
    img.dispatchEvent(new Event('load'))
    await tick()
    expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeNull()

    await rerender({ src: undefined, alt: 'Jane Doe', onLoadingStatusChange })
    await tick()

    expect(onLoadingStatusChange).toHaveBeenCalledWith('idle')
    expect(container.querySelector('[data-slot="avatar-image"]')).toBeNull()
    expect(container.querySelector('[data-slot="avatar-fallback"]')).not.toBeNull()
  })
})

describe('AvatarGroup', () => {
  it('renders a data-slot wrapper with horizontal layout and ring selectors by default', () => {
    const { container } = render(AvatarGroupHost)

    const group = container.querySelector('[data-slot="avatar-group"]') as HTMLElement
    expect(group).not.toBeNull()
    expect(group.className).toContain('flex')
    expect(group.className).toContain('space-x-[-0.2em]')
    expect(group.className).toContain('*:data-[slot=avatar]:ring-[calc(1em/12)]')
    expect(group.className).toContain('*:data-[slot=avatar]:ring-background')
  })

  it('switches to flex-col + -space-y when orientation="vertical"', () => {
    const { container } = render(AvatarGroupHost, { props: { orientation: 'vertical' } })

    const group = container.querySelector('[data-slot="avatar-group"]') as HTMLElement
    expect(group.className).toContain('flex-col')
    expect(group.className).toContain('space-y-[-0.2em]')
    expect(group.className).not.toContain('space-x-[-0.2em]')
  })

  it('propagates size to child Avatars', () => {
    const { container } = render(AvatarGroupHost, { props: { size: 'lg' } })

    const avatar = container.querySelector('[data-testid="inherits"]') as HTMLElement
    expect(avatar.className).toContain('text-[3rem]')
  })

  it('propagates shape to child Avatars', () => {
    const { container } = render(AvatarGroupHost, { props: { shape: 'rounded' } })

    const avatar = container.querySelector('[data-testid="inherits"]') as HTMLElement
    expect(avatar.className).toContain(ROUNDED_RADIUS_CLASS)
    expect(avatar.className).not.toContain('rounded-full')
  })

  it('lets an explicit prop on an inner Avatar override the group default', () => {
    const { container } = render(AvatarGroupHost, {
      props: { size: 'lg', shape: 'rounded', overrideSize: 'sm', overrideShape: 'circle' },
    })

    const overridden = container.querySelector('[data-testid="overridden"]') as HTMLElement
    expect(overridden.className).toContain('text-[2rem]')
    expect(overridden.className).toContain('rounded-full')
    expect(overridden.className).not.toContain(ROUNDED_RADIUS_CLASS)

    const inherits = container.querySelector('[data-testid="inherits"]') as HTMLElement
    expect(inherits.className).toContain('text-[3rem]')
    expect(inherits.className).toContain(ROUNDED_RADIUS_CLASS)
  })

  it('merges caller class on the wrapper', () => {
    const { container } = render(AvatarGroupHost, { props: { class: 'my-group' } })

    const group = container.querySelector('[data-slot="avatar-group"]') as HTMLElement
    expect(group.className).toContain('my-group')
  })

  it('passes non-Avatar children through without injecting size/shape', () => {
    const { container } = render(AvatarGroupHost, { props: { size: 'lg', passthrough: true } })

    const passthrough = container.querySelector('[data-testid="passthrough"]') as HTMLElement
    expect(passthrough.getAttribute('size')).toBeNull()
    expect(passthrough.getAttribute('shape')).toBeNull()
    expect(passthrough.textContent).toBe('extra')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(AvatarGroupHost, { props: { size: 'md', withImage: true } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
