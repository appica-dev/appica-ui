import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { textSnippet } from '../../test/snippet'
import Badge from './badge.svelte'

describe('Badge', () => {
  it('renders as a span by default', () => {
    render(Badge, { props: { children: textSnippet('New') } })
    const el = screen.getByText('New')
    expect(el.closest('[data-slot="badge"]')?.tagName).toBe('SPAN')
    expect(el.closest('[data-slot="badge"]')).toHaveAttribute('data-slot', 'badge')
  })

  it('renders as an anchor when href is set', () => {
    render(Badge, { props: { href: '/x', children: textSnippet('Link badge') } })
    const el = screen.getByRole('link', { name: 'Link badge' })
    expect(el.tagName).toBe('A')
    expect(el).toHaveAttribute('href', '/x')
  })

  it('renders as a button when onclick is set', async () => {
    const user = userEvent.setup()
    const onclick = vi.fn()
    render(Badge, { props: { onclick, children: textSnippet('Click badge') } })
    const el = screen.getByRole('button', { name: 'Click badge' })
    expect(el.tagName).toBe('BUTTON')
    await user.click(el)
    expect(onclick).toHaveBeenCalledOnce()
  })

  it('forwards class alongside variant classes', () => {
    render(Badge, { props: { class: 'my-badge', children: textSnippet('Hi') } })
    const el = screen.getByText('Hi').closest('[data-slot="badge"]') as HTMLElement
    expect(el.className).toContain('my-badge')
    expect(el.className).toContain('bg-primary')
  })

  it('applies size and variant classes', () => {
    render(Badge, { props: { variant: 'error', size: 'lg', children: textSnippet('Err') } })
    const el = screen.getByText('Err').closest('[data-slot="badge"]') as HTMLElement
    expect(el.className).toContain('bg-error-muted')
    expect(el.className).toContain('h-7')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Badge, { props: { children: textSnippet('Accessible') } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
