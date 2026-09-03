import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import Skeleton from './skeleton.svelte'

describe('Skeleton', () => {
  it('renders a decorative element hidden from assistive tech', () => {
    render(Skeleton, { props: { 'data-testid': 'sk' } })
    expect(screen.getByTestId('sk')).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies the shimmer effect by default', () => {
    render(Skeleton, { props: { 'data-testid': 'sk' } })
    const el = screen.getByTestId('sk')
    expect(el).toHaveAttribute('data-effect', 'shimmer')
    expect(el.className).toContain('skeleton-shimmer')
  })

  it.each(['shimmer', 'pulse', 'none'] as const)('switches to the %s effect', (effect) => {
    render(Skeleton, { props: { effect, 'data-testid': 'sk' } })
    expect(screen.getByTestId('sk')).toHaveAttribute('data-effect', effect)
  })

  it('uses animate-pulse for the pulse effect and drops the shimmer class', () => {
    render(Skeleton, { props: { effect: 'pulse', 'data-testid': 'sk' } })
    const el = screen.getByTestId('sk')
    expect(el.className).toContain('animate-pulse')
    expect(el.className).not.toContain('skeleton-shimmer')
  })

  it('recolors surface and shimmer together via a text-* class (currentColor)', () => {
    render(Skeleton, { props: { class: 'text-primary', 'data-testid': 'sk' } })
    const el = screen.getByTestId('sk')
    expect(el.className).toContain('text-primary')
    expect(el.className).not.toContain('text-foreground')
    expect(el.className).toContain('bg-current/10')
  })

  it('forwards arbitrary div props', () => {
    render(Skeleton, { props: { id: 'avatar', 'data-testid': 'sk', style: 'width: 40px' } })
    const el = screen.getByTestId('sk')
    expect(el).toHaveAttribute('id', 'avatar')
    expect(el).toHaveStyle({ width: '40px' })
  })

  it('lets consumers override the decorative default to expose a busy region', () => {
    render(Skeleton, { props: { 'aria-hidden': undefined, role: 'status', 'aria-label': 'Loading' } })
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Skeleton, { props: { class: 'h-4 w-40' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
