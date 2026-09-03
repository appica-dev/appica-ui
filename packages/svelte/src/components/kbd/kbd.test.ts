import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { textSnippet } from '../../test/snippet'
import KbdGroupHost from './kbd-group.test-host.svelte'
import Kbd from './kbd.svelte'

describe('Kbd', () => {
  it('renders a <kbd> with data-slot and default md size classes', () => {
    const { container } = render(Kbd, { props: { children: textSnippet('K') } })
    const el = container.querySelector('[data-slot="kbd"]') as HTMLElement
    expect(el).not.toBeNull()
    expect(el.tagName).toBe('KBD')
    expect(el.className).toContain('text-sm')
    expect(el.className).toContain('min-w-6')
  })

  it.each([
    ['sm', 'min-w-5', 'text-xs'],
    ['md', 'min-w-6', 'text-sm'],
    ['lg', 'min-w-7', 'text-base'],
  ] as const)('applies size="%s" classes', (size, minW, text) => {
    const { container } = render(Kbd, { props: { size, children: textSnippet('K') } })
    const el = container.querySelector('[data-slot="kbd"]') as HTMLElement
    expect(el.className).toContain(minW)
    expect(el.className).toContain(text)
  })

  it('merges caller class', () => {
    const { container } = render(Kbd, { props: { class: 'my-kbd', children: textSnippet('K') } })
    const el = container.querySelector('[data-slot="kbd"]') as HTMLElement
    expect(el.className).toContain('my-kbd')
  })

  it('forwards extra props to the kbd element', () => {
    const { container } = render(Kbd, { props: { 'aria-label': 'key', children: textSnippet('K') } })
    const el = container.querySelector('[data-slot="kbd"]') as HTMLElement
    expect(el.getAttribute('aria-label')).toBe('key')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Kbd, { props: { children: textSnippet('K') } })
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('KbdGroup', () => {
  it('renders a data-slot wrapper', () => {
    const { container } = render(KbdGroupHost)
    const group = container.querySelector('[data-slot="kbd-group"]') as HTMLElement
    expect(group).not.toBeNull()
    expect(group.className).toContain('inline-flex')
  })

  it('propagates size to child Kbd elements', () => {
    const { container } = render(KbdGroupHost, { props: { size: 'lg' } })
    const a = container.querySelector('[data-testid="a"]') as HTMLElement
    const b = container.querySelector('[data-testid="b"]') as HTMLElement
    expect(a.className).toContain('min-w-7')
    expect(b.className).toContain('min-w-7')
  })

  it('lets an explicit size on an inner Kbd override the group default', () => {
    const { container } = render(KbdGroupHost, { props: { size: 'lg', overrideSize: 'sm' } })
    const overridden = container.querySelector('[data-testid="overridden"]') as HTMLElement
    const inherits = container.querySelector('[data-testid="inherits"]') as HTMLElement
    expect(overridden.className).toContain('min-w-5')
    expect(inherits.className).toContain('min-w-7')
  })

  it('leaves non-Kbd children untouched', () => {
    const { container } = render(KbdGroupHost, { props: { size: 'lg', passthrough: true } })
    const plus = container.querySelector('[data-testid="plus"]') as HTMLElement
    expect(plus.tagName).toBe('SPAN')
    const k = container.querySelector('[data-testid="b"]') as HTMLElement
    expect(k.className).toContain('min-w-7')
  })

  it('merges caller class on the wrapper', () => {
    const { container } = render(KbdGroupHost, { props: { class: 'my-group' } })
    const group = container.querySelector('[data-slot="kbd-group"]') as HTMLElement
    expect(group.className).toContain('my-group')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(KbdGroupHost, { props: { size: 'md' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
