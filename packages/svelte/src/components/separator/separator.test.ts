import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import Separator from './separator.svelte'

describe('Separator', () => {
  it('renders with separator role', () => {
    render(Separator)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('is horizontal by default', () => {
    render(Separator)
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('renders as vertical when orientation is set', () => {
    render(Separator, { props: { orientation: 'vertical' } })
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('forwards class to the root', () => {
    render(Separator, { props: { class: 'my-separator' } })
    expect(screen.getByRole('separator').className).toContain('my-separator')
  })

  const variants = ['solid', 'dashed', 'dotted', 'double', 'gradient', 'wave', 'zigzag'] as const

  it.each(variants)('renders the %s variant in both orientations', (variant) => {
    const { rerender } = render(Separator, { props: { variant } })
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')

    rerender({ variant, orientation: 'vertical' })
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('forwards a consumer style on a decorative variant', () => {
    render(Separator, { props: { variant: 'wave', style: 'opacity: 0.5' } })
    expect(screen.getByRole('separator')).toHaveStyle({ opacity: '0.5' })
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Separator)
    expect(await axe(container)).toHaveNoViolations()
  })
})
