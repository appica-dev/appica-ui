import { render } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import ButtonGroupHost from './button-group.test-host.svelte'
import ButtonGroup from './button-group.svelte'

describe('ButtonGroup', () => {
  it('renders a data-slot wrapper with role=group and default horizontal classes', () => {
    const { container } = render(ButtonGroupHost)
    const group = container.querySelector('[data-slot="button-group"]') as HTMLElement
    expect(group).not.toBeNull()
    expect(group.getAttribute('role')).toBe('group')
    expect(group.className).toContain('flex')
    expect(group.className).toContain('w-fit')
    expect(group.className).toContain('items-stretch')
    expect(group.className).toContain('[&>*:not(:first-of-type)]:rounded-s-none')
    expect(group.className).toContain('[&>*:not(:last-of-type)]:rounded-e-none')
  })

  it('switches to vertical classes when orientation="vertical"', () => {
    const { container } = render(ButtonGroupHost, { props: { orientation: 'vertical', count: 1 } })
    const group = container.querySelector('[data-slot="button-group"]') as HTMLElement
    expect(group.className).toContain('flex-col')
    expect(group.className).toContain('[&>*:not(:first-of-type)]:rounded-t-none')
    expect(group.className).toContain('[&>*:not(:last-of-type)]:rounded-b-none')
    expect(group.className).not.toContain('rounded-l-none')
    expect(group.className).not.toContain('rounded-r-none')
  })

  it.each(['primary-outline', 'outline', 'light'] as const)(
    'uses negative -space-x for outlined variant "%s"',
    (variant) => {
      const { container } = render(ButtonGroupHost, { props: { variant, count: 1 } })
      const group = container.querySelector('[data-slot="button-group"]') as HTMLElement
      expect(group.className).toContain('-space-x-(--border-width)')
      expect(group.className).not.toContain(' space-x-(--border-width)')
    },
  )

  it('uses positive space-x for filled variants', () => {
    const { container } = render(ButtonGroupHost, { props: { variant: 'primary', count: 1 } })
    const group = container.querySelector('[data-slot="button-group"]') as HTMLElement
    expect(group.className).toContain('space-x-(--border-width)')
    expect(group.className).not.toContain('-space-x-(--border-width)')
  })

  it('uses negative -space-y for outlined variant in vertical orientation', () => {
    const { container } = render(ButtonGroupHost, {
      props: { orientation: 'vertical', variant: 'outline', count: 1 },
    })
    const group = container.querySelector('[data-slot="button-group"]') as HTMLElement
    expect(group.className).toContain('-space-y-(--border-width)')
  })

  it('uses positive space-y for filled variants in vertical orientation', () => {
    const { container } = render(ButtonGroupHost, {
      props: { orientation: 'vertical', variant: 'primary', count: 1 },
    })
    const group = container.querySelector('[data-slot="button-group"]') as HTMLElement
    expect(group.className).toContain('space-y-(--border-width)')
    expect(group.className).not.toContain('-space-y-(--border-width)')
  })

  it('propagates size to child Buttons', () => {
    const { container } = render(ButtonGroupHost, { props: { size: 'lg', count: 1 } })
    const button = container.querySelector('[data-slot="button"]') as HTMLElement
    expect(button.className).toContain('h-12')
  })

  it('propagates variant to child Buttons', () => {
    const { container } = render(ButtonGroupHost, { props: { variant: 'outline', count: 1 } })
    const button = container.querySelector('[data-testid="a"]') as HTMLElement
    expect(button.className).toContain('before:border')
  })

  it('lets an explicit prop on an inner Button override the group default', () => {
    const { container } = render(ButtonGroupHost, {
      props: { size: 'lg', variant: 'primary', overrideSize: 'sm', overrideVariant: 'ghost' },
    })

    const overridden = container.querySelector('[data-testid="overridden"]') as HTMLElement
    expect(overridden.className).toContain('h-8')
    expect(overridden.className).not.toContain('h-12')

    const inherits = container.querySelector('[data-testid="inherits"]') as HTMLElement
    expect(inherits.className).toContain('h-12')
  })

  it('merges caller className on the wrapper', () => {
    const { container } = render(ButtonGroupHost, { props: { class: 'my-group', count: 1 } })
    const group = container.querySelector('[data-slot="button-group"]') as HTMLElement
    expect(group.className).toContain('my-group')
  })

  it('propagates size/variant through a wrapping component (context, not direct child)', () => {
    const { container } = render(ButtonGroupHost, {
      props: { size: 'lg', variant: 'outline', wrapped: true },
    })

    const nested = container.querySelector('[data-testid="nested"]') as HTMLElement
    expect(nested.className).toContain('h-12')
    expect(nested.className).toContain('before:border')
  })

  it('group `disabled` disables every child Button', () => {
    const { container } = render(ButtonGroupHost, { props: { disabled: true } })

    const a = container.querySelector('[data-testid="a"]') as HTMLButtonElement
    const b = container.querySelector('[data-testid="b"]') as HTMLButtonElement
    expect(a.disabled).toBe(true)
    expect(b.disabled).toBe(true)
  })

  it('per-Button `disabled` adds to (does not override) the group state', () => {
    const { container } = render(ButtonGroupHost, { props: { ownDisabled: true } })

    const own = container.querySelector('[data-testid="own"]') as HTMLButtonElement
    const other = container.querySelector('[data-testid="other"]') as HTMLButtonElement
    expect(own.disabled).toBe(true)
    expect(other.disabled).toBe(false)
  })

  it('group disabled wins over a child setting disabled={false}', () => {
    const { container } = render(ButtonGroupHost, { props: { disabled: true, childDisabledFalse: true } })

    const b = container.querySelector('[data-testid="b"]') as HTMLButtonElement
    expect(b.disabled).toBe(true)
  })

  it('Button outside any group keeps its defaults (variant=primary, size=md, not disabled)', () => {
    const { container } = render(ButtonGroupHost, { props: { solo: true } })
    const btn = container.querySelector('[data-testid="solo"]') as HTMLButtonElement
    expect(btn.disabled).toBe(false)
    expect(btn.className).toContain('h-10')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(ButtonGroupHost, {
      props: { size: 'md', variant: 'outline', count: 3 },
    })

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders without children', () => {
    const { container } = render(ButtonGroup)
    const group = container.querySelector('[data-slot="button-group"]')
    expect(group).not.toBeNull()
  })
})
