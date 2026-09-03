import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import RadioHost from './radio.test-host.svelte'

describe('Radio', () => {
  it('renders with radio role', () => {
    render(RadioHost)
    expect(screen.getByRole('radio', { name: 'Option A' })).toBeInTheDocument()
  })

  it('reflects defaultValue from the group', () => {
    render(RadioHost, { props: { defaultValue: 'b' } })
    expect(screen.getByRole('radio', { name: 'Option A' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Option B' })).toBeChecked()
  })

  it('bridges aria-invalid to data-invalid for error styling', () => {
    render(RadioHost, { props: { invalid: true } })
    const radio = screen.getByRole('radio', { name: 'Invalid' })
    expect(radio).toHaveAttribute('aria-invalid', 'true')
    expect(radio).toHaveAttribute('data-invalid')
  })

  it('does not set data-invalid when valid', () => {
    render(RadioHost)
    expect(screen.getByRole('radio', { name: 'Option A' })).not.toHaveAttribute('data-invalid')
  })

  it('selects when clicked', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(RadioHost, { props: { onValueChange } })

    await user.click(screen.getByRole('radio', { name: 'Option B' }))
    expect(onValueChange).toHaveBeenCalledWith('b')
    expect(screen.getByRole('radio', { name: 'Option B' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Option A' })).not.toBeChecked()
  })

  it('moves selection with ArrowDown (composite roving focus)', async () => {
    const user = userEvent.setup()
    render(RadioHost, { props: { defaultValue: 'a' } })
    screen.getByRole('radio', { name: 'Option A' }).focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'Option B' })).toBeChecked()
  })

  it('does not select when disabled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(RadioHost, { props: { disabled: true, onValueChange } })

    await user.click(screen.getByRole('radio', { name: 'Option A' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('honors controlled value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(RadioHost, { props: { value: 'a', onValueChange } })

    await user.click(screen.getByRole('radio', { name: 'Option B' }))
    expect(onValueChange).toHaveBeenCalledWith('b')
    expect(screen.getByRole('radio', { name: 'Option A' })).toBeChecked()
  })

  it('forwards class to the root', () => {
    render(RadioHost, { props: { class: 'custom-class' } })
    expect(screen.getByRole('radio', { name: 'Option A' }).className).toContain('custom-class')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(RadioHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
