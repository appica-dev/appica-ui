import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import Switch from './switch.svelte'
import SwitchControlledHost from './switch.controlled-host.svelte'

describe('Switch', () => {
  it('renders with switch role', () => {
    render(Switch, { props: { 'aria-label': 'Notifications' } })
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('reflects defaultChecked', () => {
    render(Switch, { props: { defaultChecked: true, 'aria-label': 'On' } })
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('bridges aria-invalid to data-invalid for error styling', () => {
    render(Switch, { props: { 'aria-invalid': true, 'aria-label': 'Invalid' } })
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-invalid', 'true')
    expect(sw).toHaveAttribute('data-invalid')
  })

  it('does not set data-invalid when valid', () => {
    render(Switch, { props: { 'aria-label': 'Valid' } })
    expect(screen.getByRole('switch')).not.toHaveAttribute('data-invalid')
  })

  it('toggles when clicked', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(Switch, { props: { 'aria-label': 'Toggle', onCheckedChange } })

    const sw = screen.getByRole('switch')
    expect(sw).not.toBeChecked()

    await user.click(sw)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(sw).toBeChecked()
  })

  it('toggles via keyboard (Space)', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(Switch, { props: { 'aria-label': 'Toggle', onCheckedChange } })

    const sw = screen.getByRole('switch')
    sw.focus()
    await user.keyboard(' ')
    expect(onCheckedChange).toHaveBeenCalledOnce()
    expect(sw).toBeChecked()
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(Switch, { props: { disabled: true, 'aria-label': 'Disabled', onCheckedChange } })

    await user.click(screen.getByRole('switch'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('honors controlled checked prop', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(SwitchControlledHost, { props: { locked: false, onCheckedChange } })

    const sw = screen.getByRole('switch')
    await user.click(sw)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(sw).not.toBeChecked()
  })

  it('applies size styles to the root', () => {
    render(Switch, { props: { size: 'lg', 'aria-label': 'Large' } })
    expect(screen.getByRole('switch').className).toContain('h-6')
  })

  it('forwards class to the root', () => {
    render(Switch, { props: { class: 'custom-class', 'aria-label': 'Styled' } })
    expect(screen.getByRole('switch').className).toContain('custom-class')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Switch, { props: { 'aria-label': 'Notifications' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
