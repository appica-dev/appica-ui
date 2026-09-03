import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import Checkbox from './checkbox.svelte'
import CheckboxControlledHost from './checkbox.controlled-host.svelte'

describe('Checkbox', () => {
  it('renders with checkbox role', () => {
    render(Checkbox, { props: { 'aria-label': 'Subscribe' } })
    expect(screen.getByRole('checkbox', { name: 'Subscribe' })).toBeInTheDocument()
  })

  it('reflects defaultChecked', () => {
    render(Checkbox, { props: { defaultChecked: true, 'aria-label': 'Default on' } })
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('bridges aria-invalid to data-invalid for error styling', () => {
    render(Checkbox, { props: { 'aria-invalid': true, 'aria-label': 'Invalid' } })
    const cb = screen.getByRole('checkbox')
    expect(cb).toHaveAttribute('aria-invalid', 'true')
    expect(cb).toHaveAttribute('data-invalid')
  })

  it('does not set data-invalid when valid', () => {
    render(Checkbox, { props: { 'aria-label': 'Valid' } })
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('data-invalid')
  })

  it('toggles when clicked', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(Checkbox, { props: { 'aria-label': 'Toggle', onCheckedChange } })

    const cb = screen.getByRole('checkbox')
    expect(cb).not.toBeChecked()

    await user.click(cb)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(cb).toBeChecked()
  })

  it('toggles via Space key', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(Checkbox, { props: { 'aria-label': 'Toggle', onCheckedChange } })

    const cb = screen.getByRole('checkbox')
    cb.focus()
    await user.keyboard(' ')
    expect(onCheckedChange).toHaveBeenCalledOnce()
    expect(cb).toBeChecked()
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(Checkbox, { props: { disabled: true, 'aria-label': 'Disabled', onCheckedChange } })

    await user.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('honors indeterminate prop', () => {
    render(Checkbox, { props: { indeterminate: true, 'aria-label': 'Mixed' } })
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed')
  })

  it('honors controlled checked prop', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(CheckboxControlledHost, { props: { locked: false, onCheckedChange } })

    const cb = screen.getByRole('checkbox')
    await user.click(cb)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(cb).not.toBeChecked()
  })

  it('forwards class to the root', () => {
    render(Checkbox, { props: { class: 'custom-class', 'aria-label': 'Styled' } })
    expect(screen.getByRole('checkbox').className).toContain('custom-class')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Checkbox, { props: { 'aria-label': 'Subscribe' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
