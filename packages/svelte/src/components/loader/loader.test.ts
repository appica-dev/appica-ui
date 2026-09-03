import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import Loader from './loader.svelte'

describe('Loader', () => {
  it('exposes a status region with a default accessible name', () => {
    render(Loader)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })

  it('forwards a custom aria-label', () => {
    render(Loader, { props: { 'aria-label': 'Uploading attachment' } })
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Uploading attachment')
  })

  it('renders the status region as a <span> so it nests inside <p> without invalid HTML', () => {
    render(Loader)
    expect(screen.getByRole('status').tagName).toBe('SPAN')
  })

  it.each(['bar', 'dots'] as const)('renders the %s variant without throwing', (variant) => {
    render(Loader, { props: { variant } })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('uses primary palette by default', () => {
    const { container } = render(Loader)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('class')).toContain('text-primary')
  })

  it('switches to currentColor when the prop is set', () => {
    const { container } = render(Loader, { props: { currentColor: true } })
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('class')).toContain('text-current')
    expect(svg.getAttribute('class')).not.toContain('text-primary')
  })

  it('lets class override the default size via tailwind-merge', () => {
    render(Loader, { props: { class: 'text-xl' } })
    const status = screen.getByRole('status')
    expect(status.className).toContain('text-xl')
    expect(status.className).not.toContain('text-[2.5rem]')
  })

  it('forwards arbitrary span props', () => {
    render(Loader, { props: { 'data-testid': 'busy', id: 'loader-1' } })
    const status = screen.getByTestId('busy')
    expect(status).toHaveAttribute('id', 'loader-1')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Loader)
    expect(await axe(container)).toHaveNoViolations()
  })
})
