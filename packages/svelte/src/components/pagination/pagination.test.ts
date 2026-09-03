import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { textSnippet } from '../../test/snippet'
import PaginationHost from './pagination.test-host.svelte'
import PaginationLink from './pagination-link.svelte'

describe('Pagination', () => {
  it('renders a nav with pagination role and label', () => {
    render(PaginationHost)
    const nav = screen.getByRole('navigation', { name: 'pagination' })
    expect(nav.tagName).toBe('NAV')
    expect(nav).toHaveAttribute('data-slot', 'pagination')
  })

  it('renders content as a ul and items as li', () => {
    render(PaginationHost)
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(list).toHaveAttribute('data-slot', 'pagination-list')
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(6)
  })

  it('marks the active link with aria-current and data-active', () => {
    render(PaginationHost)
    const active = screen.getByRole('link', { current: 'page' })
    expect(active).toHaveTextContent('2')
    expect(active).toHaveAttribute('data-active')
  })

  it('marks disabled links with aria-disabled and data-disabled', () => {
    render(PaginationHost, { props: { disabledPrev: true } })
    const link = screen.getByRole('link', { name: 'Go to previous page' })
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('data-disabled')
  })

  it('forwards class alongside variant classes on the link', () => {
    render(PaginationHost, { props: { linkClass: 'my-link' } })
    const link = screen.getByRole('link', { name: '1' })
    expect(link.className).toContain('my-link')
  })

  it('renders link as a button when el="button"', () => {
    render(PaginationHost, { props: { linkEl: 'button' } })
    const el = screen.getByRole('button', { name: '1' })
    expect(el.tagName).toBe('BUTTON')
  })

  it('fires onclick on the link', async () => {
    const user = userEvent.setup()
    const onclick = vi.fn()
    render(PaginationHost, { props: { onclick } })
    await user.click(screen.getByRole('link', { name: '1' }))
    expect(onclick).toHaveBeenCalledOnce()
  })

  it('renders the ellipsis as a decorative (aria-hidden) element', () => {
    render(PaginationHost)
    const ellipsis = document.querySelector('[data-slot="pagination-ellipsis"]')
    expect(ellipsis).not.toBeNull()
    expect(ellipsis).toHaveAttribute('aria-hidden')
  })

  it('throws when a sub-component is used outside Pagination', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(PaginationLink, { props: { href: '#', children: textSnippet('1') } })).toThrow(
      /must be rendered inside <Pagination>/,
    )
    spy.mockRestore()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(PaginationHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
