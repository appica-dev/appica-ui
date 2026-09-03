import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import Toggle from './toggle.svelte'
import ToggleHost from './toggle.test-host.svelte'
import ToggleControlledHost from './toggle.controlled-host.svelte'

describe('Toggle', () => {
  it('renders as a button', () => {
    render(ToggleHost)
    const el = screen.getByRole('button', { name: 'Bold' })
    expect(el.tagName).toBe('BUTTON')
    expect(el).toHaveAttribute('aria-pressed', 'false')
  })

  it('reflects defaultPressed', () => {
    render(Toggle, { props: { defaultPressed: true, 'aria-label': 'Bold' } })
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('toggles when clicked', async () => {
    const user = userEvent.setup()
    const onPressedChange = vi.fn()
    render(ToggleHost, { props: { onPressedChange } })

    const btn = screen.getByRole('button', { name: 'Bold' })
    await user.click(btn)
    expect(onPressedChange).toHaveBeenCalledWith(true)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(btn).toHaveAttribute('data-pressed')
  })

  it('toggles via keyboard (Space)', async () => {
    const user = userEvent.setup()
    const onPressedChange = vi.fn()
    render(ToggleHost, { props: { onPressedChange } })

    const btn = screen.getByRole('button', { name: 'Bold' })
    btn.focus()
    await user.keyboard(' ')
    expect(onPressedChange).toHaveBeenCalledOnce()
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    const onPressedChange = vi.fn()
    render(ToggleHost, { props: { disabled: true, onPressedChange } })

    await user.click(screen.getByRole('button', { name: 'Bold' }))
    expect(onPressedChange).not.toHaveBeenCalled()
  })

  it('honors controlled pressed prop', async () => {
    const user = userEvent.setup()
    const onPressedChange = vi.fn()
    render(ToggleControlledHost, { props: { locked: false, onPressedChange } })

    const btn = screen.getByRole('button', { name: 'Bold' })
    await user.click(btn)
    expect(onPressedChange).toHaveBeenCalledWith(true)
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('forwards class', () => {
    render(ToggleHost, { props: { class: 'custom-class' } })
    expect(screen.getByRole('button', { name: 'Bold' }).className).toContain('custom-class')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(ToggleHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
