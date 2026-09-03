import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import BreadcrumbHost from './breadcrumb.test-host.svelte'

describe('Breadcrumb', () => {
  it('renders a nav with breadcrumb label and an ordered list', () => {
    render(BreadcrumbHost)
    const nav = screen.getByRole('navigation', { name: 'breadcrumb' })
    expect(nav.tagName).toBe('NAV')
    expect(nav).toHaveAttribute('data-slot', 'breadcrumb')
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(list).toHaveAttribute('data-slot', 'breadcrumb-list')
  })

  it('renders BreadcrumbItem as li', () => {
    render(BreadcrumbHost)
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThan(0)
    items.forEach((li) => expect(li.tagName).toBe('LI'))
  })

  it('renders an inactive link as <a> and fires onclick', async () => {
    const user = userEvent.setup()
    const onclick = vi.fn()
    render(BreadcrumbHost, { props: { onclick } })
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link.tagName).toBe('A')
    await user.click(link)
    expect(onclick).toHaveBeenCalledOnce()
  })

  it('renders an active link as a non-focusable <span> with aria-current="page" and data-active', () => {
    render(BreadcrumbHost)
    const active = screen.getByText('Breadcrumb')
    expect(active.tagName).toBe('SPAN')
    expect(active).toHaveAttribute('aria-current', 'page')
    expect(active).toHaveAttribute('aria-disabled', 'true')
    expect(active).toHaveAttribute('data-active')
    expect(active).toHaveAttribute('tabindex', '-1')
  })

  it('marks a disabled link with aria-disabled and data-disabled', () => {
    render(BreadcrumbHost, { props: { disabled: true } })
    const link = screen.getByRole('link', { name: 'Components' })
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('data-disabled')
  })

  it('forwards class to the link alongside default classes', () => {
    render(BreadcrumbHost, { props: { linkClass: 'my-link' } })
    expect(screen.getByRole('link', { name: 'Home' }).className).toContain('my-link')
  })

  it('renders the link as a button when el="button"', () => {
    render(BreadcrumbHost, { props: { linkEl: 'button' } })
    const el = screen.getByRole('button', { name: 'Home' })
    expect(el.tagName).toBe('BUTTON')
  })

  it('renders a default separator svg, overridable via children', () => {
    const { rerender } = render(BreadcrumbHost)
    const sep = screen.getByTestId('sep')
    expect(sep).toHaveAttribute('data-slot', 'breadcrumb-separator')
    expect(sep.querySelector('svg')).not.toBeNull()

    rerender({ separatorText: '/' })
    const sepAgain = screen.getByTestId('sep')
    expect(sepAgain.querySelector('svg')).toBeNull()
    expect(sepAgain).toHaveTextContent('/')
  })

  it('renders the ellipsis as a decorative (aria-hidden) element', () => {
    render(BreadcrumbHost)
    const ellipsis = document.querySelector('[data-slot="breadcrumb-ellipsis"]')
    expect(ellipsis).not.toBeNull()
    expect(ellipsis).toHaveAttribute('aria-hidden')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(BreadcrumbHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
