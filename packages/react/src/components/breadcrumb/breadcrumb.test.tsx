import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb'

function renderBasic() {
  return render(
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink active>Breadcrumb</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  )
}

describe('Breadcrumb', () => {
  it('renders a nav with breadcrumb label and an ordered list', () => {
    renderBasic()
    const nav = screen.getByRole('navigation', { name: 'breadcrumb' })
    expect(nav.tagName).toBe('NAV')
    expect(nav).toHaveAttribute('data-slot', 'breadcrumb')
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(list).toHaveAttribute('data-slot', 'breadcrumb-list')
  })

  it('renders BreadcrumbItem as li', () => {
    renderBasic()
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeGreaterThan(0)
    items.forEach((li) => expect(li.tagName).toBe('LI'))
  })

  it('renders an inactive link as <a> and fires onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={onClick}>
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const link = screen.getByRole('link', { name: 'Home' })
    expect(link.tagName).toBe('A')
    await user.click(link)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders an active link as a non-focusable <span> with aria-current="page" and data-active', () => {
    renderBasic()
    const active = screen.getByText('Breadcrumb')
    expect(active.tagName).toBe('SPAN')
    expect(active).toHaveAttribute('aria-current', 'page')
    expect(active).toHaveAttribute('data-active')
    expect(active).not.toHaveAttribute('tabindex')
  })

  it('does not mark the active crumb as disabled', () => {
    renderBasic()
    const active = screen.getByText('Breadcrumb')
    expect(active).not.toHaveAttribute('aria-disabled')
    expect(active).not.toHaveAttribute('data-disabled')
  })

  it('skips the active crumb when tabbing', async () => {
    const user = userEvent.setup()
    renderBasic()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'Components' })).toHaveFocus()
    await user.tab()
    expect(document.body).toHaveFocus()
  })

  it('keeps an active crumb rendered as a link reachable', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink active render={<a href="/current" />}>
              Current
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const link = screen.getByRole('link', { name: 'Current', current: 'page' })
    expect(link).not.toHaveAttribute('tabindex')
    expect(link).not.toHaveAttribute('aria-disabled')
  })

  it('marks a disabled link with aria-disabled and data-disabled', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" disabled>
              Frozen
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const link = screen.getByRole('link', { name: 'Frozen' })
    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('data-disabled')
    expect(link).toHaveAttribute('tabindex', '-1')
    expect(link).not.toHaveAttribute('aria-current')
  })

  it('forwards className to the link alongside default classes', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" className="my-link">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(screen.getByRole('link', { name: 'Home' }).className).toContain('my-link')
  })

  it('renders the link as a different element via render prop', () => {
    const onClick = vi.fn()
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<button type="button" onClick={onClick} />}>Settings</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const el = screen.getByRole('button', { name: 'Settings' })
    expect(el.tagName).toBe('BUTTON')
  })

  it('renders a default separator svg, overridable via children', () => {
    const { rerender } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">A</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator data-testid="sep" />
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const sep = screen.getByTestId('sep')
    expect(sep).toHaveAttribute('data-slot', 'breadcrumb-separator')
    expect(sep.querySelector('svg')).not.toBeNull()

    rerender(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">A</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator data-testid="sep">/</BreadcrumbSeparator>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    const sepAgain = screen.getByTestId('sep')
    expect(sepAgain.querySelector('svg')).toBeNull()
    expect(sepAgain).toHaveTextContent('/')
  })

  it('renders the ellipsis as a decorative (aria-hidden) element', () => {
    renderBasic()
    const ellipsis = document.querySelector('[data-slot="breadcrumb-ellipsis"]')
    expect(ellipsis).not.toBeNull()
    expect(ellipsis).toHaveAttribute('aria-hidden')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderBasic()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations with a disabled crumb', async () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" disabled>
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink active>Current</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
