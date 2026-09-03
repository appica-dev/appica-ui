import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import NavigationMenuHost from './navigation-menu.test-host.svelte'
import NavigationMenuIconOverrideHost from './navigation-menu.icon-override-host.svelte'

const setupUser = () => userEvent.setup({ pointerEventsCheck: 0 })
const overlay = { hidden: true as const }

describe('NavigationMenu', () => {
  it('renders with the navigation-menu data-slot and horizontal orientation by default', () => {
    const { container } = render(NavigationMenuHost)
    const root = container.querySelector('[data-slot="navigation-menu"]') as HTMLElement
    expect(root).not.toBeNull()
    expect(root.getAttribute('data-orientation')).toBe('horizontal')
  })

  it('applies the pill gap to the list by default', () => {
    const { container } = render(NavigationMenuHost)
    const list = container.querySelector('[data-slot="navigation-menu-list"]') as HTMLElement
    expect(list.className).toContain('gap-0.5')
  })

  it('applies the line gap to the list when variant is line', () => {
    const { container } = render(NavigationMenuHost, { props: { variant: 'line' } })
    const list = container.querySelector('[data-slot="navigation-menu-list"]') as HTMLElement
    expect(list.className).toContain('gap-7')
  })

  it('stacks the list vertically when orientation is vertical', () => {
    const { container } = render(NavigationMenuHost, { props: { orientation: 'vertical' } })
    const list = container.querySelector('[data-slot="navigation-menu-list"]') as HTMLElement
    expect(list.className).toContain('flex-col')
  })

  it('styles triggers with the pill variant by default', () => {
    const { container } = render(NavigationMenuHost)
    const trigger = container.querySelector('[data-slot="navigation-menu-trigger"]') as HTMLElement
    expect(trigger.className).toContain('before:bg-background-muted')
  })

  it('styles triggers with the line variant when requested', () => {
    const { container } = render(NavigationMenuHost, { props: { variant: 'line' } })
    const trigger = container.querySelector('[data-slot="navigation-menu-trigger"]') as HTMLElement
    expect(trigger.className).toContain('after:bg-no-repeat')
  })

  it('mirrors the root orientation onto each trigger', () => {
    const { container } = render(NavigationMenuHost, { props: { orientation: 'vertical' } })
    const trigger = container.querySelector('[data-slot="navigation-menu-trigger"]') as HTMLElement
    expect(trigger.getAttribute('data-orientation')).toBe('vertical')
  })

  it('propagates size to the trigger text class', () => {
    const { container } = render(NavigationMenuHost, { props: { size: 'lg' } })
    const trigger = container.querySelector('[data-slot="navigation-menu-trigger"]') as HTMLElement
    expect(trigger.className).toContain('text-base')
  })

  it('renders a chevron icon by default and sizes it by the root size', () => {
    const { container } = render(NavigationMenuHost, { props: { size: 'md' } })
    const icon = container.querySelector('[data-slot="navigation-menu-icon"]') as HTMLElement
    expect(icon).not.toBeNull()
    const svg = icon.querySelector('svg') as SVGElement
    expect(svg.getAttribute('viewBox')).toBe('0 0 16 16')
    expect(svg.getAttribute('class') ?? '').toContain('size-4')
  })

  it('renders a caret icon when icon="caret"', () => {
    const { container } = render(NavigationMenuHost, { props: { icon: 'caret' } })
    const svg = container.querySelector('[data-slot="navigation-menu-icon"] svg') as SVGElement
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
  })

  it('renders the plus icon with two rects when icon="plus"', () => {
    const { container } = render(NavigationMenuHost, { props: { icon: 'plus' } })
    const svg = container.querySelector('[data-slot="navigation-menu-icon"] svg') as SVGElement
    const rects = svg.querySelectorAll('rect')
    expect(rects).toHaveLength(2)
    expect(svg.getAttribute('class') ?? '').toContain('group-data-popup-open/navigation-menu-icon:rotate-180')
    expect(rects[1]?.getAttribute('class') ?? '').toContain('group-data-popup-open/navigation-menu-icon:rotate-90')
  })

  it('renders nothing for the icon when icon is false at the root', () => {
    const { container } = render(NavigationMenuHost, { props: { icon: false } })
    expect(container.querySelector('[data-slot="navigation-menu-icon"]')).toBeNull()
  })

  it('per-icon override beats the root', () => {
    const { container } = render(NavigationMenuIconOverrideHost)
    expect(container.querySelector('[data-slot="navigation-menu-icon"]')).toBeNull()
  })

  it('applies the smaller icon size class when size="sm"', () => {
    const { container } = render(NavigationMenuHost, { props: { size: 'sm' } })
    const svg = container.querySelector('[data-slot="navigation-menu-icon"] svg') as SVGElement
    expect(svg.getAttribute('class') ?? '').toContain('size-3.5')
  })

  it('opens the menu on trigger click and shows the link inside the popup', async () => {
    const user = setupUser()
    render(NavigationMenuHost)
    await user.click(screen.getByRole('button', { name: /Products/ }))
    expect(await screen.findByRole('link', { name: 'Product One', ...overlay })).toBeInTheDocument()
  })

  it('closes the menu on Escape', async () => {
    const user = setupUser()
    render(NavigationMenuHost)
    await user.click(screen.getByRole('button', { name: /Products/ }))
    await screen.findByRole('link', { name: 'Product One', ...overlay })
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Product One', ...overlay })).toBeNull()
    })
  })

  it('renders the backdrop when backdrop is true after opening', async () => {
    const user = setupUser()
    render(NavigationMenuHost, { props: { backdrop: true } })
    await user.click(screen.getByRole('button', { name: /Products/ }))
    await screen.findByRole('link', { name: 'Product One', ...overlay })
    expect(document.querySelector('[data-slot="navigation-menu-backdrop"]')).not.toBeNull()
  })

  it('applies the viewport size CSS vars by default so the popup morphs', async () => {
    const user = setupUser()
    render(NavigationMenuHost)
    await user.click(screen.getByRole('button', { name: /Products/ }))
    await screen.findByRole('link', { name: 'Product One', ...overlay })
    const popup = document.querySelector('[data-slot="navigation-menu-popup"]') as HTMLElement
    expect(popup.className).toContain('w-(--bits-navigation-menu-viewport-width)')
    expect(popup.className).toContain('h-(--bits-navigation-menu-viewport-height)')
  })

  it('drops the size CSS vars when morph is false', async () => {
    const user = setupUser()
    render(NavigationMenuHost, { props: { morph: false } })
    await user.click(screen.getByRole('button', { name: /Products/ }))
    await screen.findByRole('link', { name: 'Product One', ...overlay })
    const popup = document.querySelector('[data-slot="navigation-menu-popup"]') as HTMLElement
    expect(popup.className).not.toContain('w-(--bits-navigation-menu-viewport-width)')
    expect(popup.className).not.toContain('h-(--bits-navigation-menu-viewport-height)')
  })

  it('omits the backdrop by default', async () => {
    const user = setupUser()
    render(NavigationMenuHost)
    await user.click(screen.getByRole('button', { name: /Products/ }))
    await screen.findByRole('link', { name: 'Product One', ...overlay })
    expect(document.querySelector('[data-slot="navigation-menu-backdrop"]')).toBeNull()
  })

  it('skips the auto-rendered viewport when viewport is false', async () => {
    const user = setupUser()
    render(NavigationMenuHost, { props: { viewport: false } })
    await user.click(screen.getByRole('button', { name: /Products/ }))
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(document.querySelector('[data-slot="navigation-menu-popup"]')).toBeNull()
  })

  it('has no accessibility violations when closed', async () => {
    const { container } = render(NavigationMenuHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
