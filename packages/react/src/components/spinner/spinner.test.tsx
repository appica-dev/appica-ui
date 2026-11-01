import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { Spinner } from './spinner'

describe('Spinner', () => {
  it('exposes a status region that reads "Loading" as text by default', () => {
    render(<Spinner />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Loading')
    expect(status).not.toHaveAttribute('aria-label')
  })

  it('renders a custom aria-label as the status text', () => {
    render(<Spinner aria-label="Fetching results" />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Fetching results')
    expect(status).not.toHaveAttribute('aria-label')
  })

  it('contributes its label to the name of a surrounding button', () => {
    render(
      <button type="button">
        <Spinner aria-label="Saving" currentColor />
      </button>,
    )
    expect(screen.getByRole('button', { name: 'Saving' })).toBeInTheDocument()
  })

  it('renders the status region as a <span> so it nests inside <p> without invalid HTML', () => {
    render(<Spinner />)
    expect(screen.getByRole('status').tagName).toBe('SPAN')
  })

  it.each(['circular', 'dots', 'sparkle'] as const)('renders the %s variant without throwing', (variant) => {
    render(<Spinner variant={variant} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('uses primary palette by default', () => {
    const { container } = render(<Spinner />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('class')).toContain('text-primary')
  })

  it('switches to currentColor when the prop is set', () => {
    const { container } = render(<Spinner currentColor />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('class')).toContain('text-current')
    expect(svg.getAttribute('class')).not.toContain('text-primary')
  })

  it('lets className override the default size via tailwind-merge', () => {
    render(<Spinner className="text-xl" />)
    const status = screen.getByRole('status')
    expect(status.className).toContain('text-xl')
    expect(status.className).not.toContain('text-[2.5rem]')
  })

  it('forwards arbitrary span props', () => {
    render(<Spinner data-testid="busy" id="spinner-1" />)
    const status = screen.getByTestId('busy')
    expect(status).toHaveAttribute('id', 'spinner-1')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Spinner aria-label="Loading" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
