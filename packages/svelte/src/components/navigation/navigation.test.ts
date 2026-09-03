import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { htmlSnippet, textSnippet } from '../../test/snippet'
import NavigationLink from './navigation-link.svelte'
import NavigationHost from './navigation.test-host.svelte'

describe('Navigation', () => {
  it('renders as a <nav> with role and accessible name', () => {
    render(NavigationHost)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav.tagName).toBe('NAV')
    expect(nav).toHaveAttribute('data-slot', 'navigation')
  })

  it('defaults to horizontal orientation via data-orientation', () => {
    render(NavigationHost)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav).not.toHaveAttribute('aria-orientation')
    expect(nav).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('marks vertical orientation with data-orientation', () => {
    render(NavigationHost, { props: { orientation: 'vertical', ariaLabel: 'Side' } })
    const nav = screen.getByRole('navigation', { name: 'Side' })
    expect(nav).toHaveAttribute('data-orientation', 'vertical')
  })

  it('renders <ul> for the list and <li> for items', () => {
    render(NavigationHost)
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('data-slot', 'navigation-list')
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('activeLink matches the link with the corresponding value', () => {
    render(NavigationHost, { props: { activeLink: 'about' } })
    const active = screen.getByRole('link', { current: 'page' })
    expect(active).toHaveTextContent('About')
    expect(active).toHaveAttribute('data-active')
  })

  it('per-link active={true} overrides activeLink mismatch', () => {
    render(NavigationHost, { props: { forceActive: true, activeLink: 'home' } })
    const link = screen.getByRole('link', { name: 'About' })
    expect(link).toHaveAttribute('aria-current', 'page')
  })

  it('per-link active={false} overrides activeLink match', () => {
    render(NavigationHost, { props: { forceInactive: true, activeLink: 'home' } })
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link).not.toHaveAttribute('aria-current')
    expect(link).not.toHaveAttribute('data-active')
  })

  it('disabled links carry aria-disabled and data-disabled', () => {
    render(NavigationHost, { props: { disabled: true } })
    const link = screen.getByRole('link', { name: 'Disabled' })
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('data-disabled')
  })

  it('forwards class alongside variant classes on the link', () => {
    render(NavigationHost, { props: { linkClass: 'my-link' } })
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link.className).toContain('my-link')
  })

  it('renders the link as a button when el="button"', () => {
    render(NavigationHost, { props: { linkEl: 'button' } })
    const el = screen.getByRole('button', { name: 'Home' })
    expect(el.tagName).toBe('BUTTON')
  })

  it('fires onclick on the link', async () => {
    const user = userEvent.setup()
    const onclick = vi.fn()
    render(NavigationHost, { props: { onclick } })
    await user.click(screen.getByRole('link', { name: 'Home' }))
    expect(onclick).toHaveBeenCalledOnce()
  })

  it('renders NavigationLink standalone without a Navigation root', () => {
    render(NavigationHost, { props: { standalone: true } })
    const link = screen.getByRole('link', { name: 'Solo' })
    expect(link).toHaveAttribute('data-slot', 'navigation-link')
  })

  it('indicator variant wraps children in a label slot and renders an indicator slot', () => {
    render(NavigationHost, { props: { variant: 'indicator' } })
    const link = screen.getByRole('link', { name: 'One' })
    expect(link.querySelector('[data-slot="navigation-link-indicator"]')).not.toBeNull()
    const label = link.querySelector('[data-slot="navigation-link-label"]')
    expect(label).not.toBeNull()
    expect(label).toHaveTextContent('One')
  })

  it('indicator variant accepts a custom indicator snippet', () => {
    render(NavigationHost, {
      props: { customIndicator: true, indicator: htmlSnippet('<span data-testid="custom-indicator"></span>') },
    })
    expect(screen.getByTestId('custom-indicator')).toBeInTheDocument()
  })

  it('stamps data-orientation="horizontal" on links by default', () => {
    render(NavigationHost)
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('data-orientation', 'horizontal')
    }
  })

  it('propagates vertical orientation to links via context', () => {
    render(NavigationHost, { props: { orientation: 'vertical', ariaLabel: 'Side' } })
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('data-orientation', 'vertical')
  })

  it('NavigationLink orientation prop overrides context', () => {
    render(NavigationLink, {
      props: { href: '#a', orientation: 'vertical', children: textSnippet('A') },
    })
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('data-orientation', 'vertical')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(NavigationHost, { props: { activeLink: 'home' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
