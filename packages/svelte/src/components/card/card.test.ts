import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import CardHost from './card.test-host.svelte'

describe('Card', () => {
  it('renders a div root with data-slot by default', () => {
    const { container } = render(CardHost)
    const root = container.querySelector('[data-slot="card"]') as HTMLElement
    expect(root.tagName).toBe('DIV')
    expect(root).toHaveAttribute('data-inset')
    expect(container.querySelector('[data-slot="card-content"]')).not.toBeNull()
  })

  it('switches the root tag via el', () => {
    const { container } = render(CardHost, { props: { el: 'article' } })
    const root = container.querySelector('[data-slot="card"]') as HTMLElement
    expect(root.tagName).toBe('ARTICLE')
  })

  it('renders compound parts', () => {
    render(CardHost)
    expect(screen.getByText('Title')).toHaveAttribute('data-slot', 'card-title')
    expect(screen.getByText('Description')).toHaveAttribute('data-slot', 'card-description')
    expect(screen.getByText('Footer').closest('[data-slot="card-footer"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="card-media"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="card-header"]')).not.toBeNull()
  })

  it('applies a solid frame', () => {
    const { container } = render(CardHost, { props: { frame: true } })
    const root = container.querySelector('[data-slot="card"]') as HTMLElement
    expect(root).toHaveAttribute('data-frame', 'solid')
    expect(root.className).toContain('bg-background-subtle')
  })

  it('forwards class on the root', () => {
    const { container } = render(CardHost, { props: { class: 'my-card' } })
    expect((container.querySelector('[data-slot="card"]') as HTMLElement).className).toContain('my-card')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(CardHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
