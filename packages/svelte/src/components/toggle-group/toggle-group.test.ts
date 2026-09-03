import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import ToggleGroupHost from './toggle-group.test-host.svelte'

describe('ToggleGroup', () => {
  it('renders a group with its toggles', () => {
    render(ToggleGroupHost)
    const group = screen.getByRole('group', { name: 'Text alignment' })
    expect(group).toHaveAttribute('data-slot', 'toggle-group')
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('reflects defaultValue as pressed', () => {
    render(ToggleGroupHost, { props: { defaultValue: 'center' } })
    expect(screen.getByRole('button', { name: 'Center' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('single-select deselects the previous toggle', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(ToggleGroupHost, { props: { defaultValue: 'left', onValueChange } })

    await user.click(screen.getByRole('button', { name: 'Right' }))
    expect(onValueChange).toHaveBeenLastCalledWith('right')
    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Right' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('multiple-select keeps several toggles pressed', async () => {
    const user = userEvent.setup()
    render(ToggleGroupHost, { props: { multiple: true } })

    await user.click(screen.getByRole('button', { name: 'Left' }))
    await user.click(screen.getByRole('button', { name: 'Right' }))
    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Right' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('navigates between toggles with arrow keys', async () => {
    const user = userEvent.setup()
    render(ToggleGroupHost)

    const left = screen.getByRole('button', { name: 'Left' })
    left.focus()
    expect(left).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Center' })).toHaveFocus()
  })

  it('disables all toggles when the group is disabled', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(ToggleGroupHost, { props: { disabled: true, onValueChange } })

    await user.click(screen.getByRole('button', { name: 'Left' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('applies vertical orientation', () => {
    render(ToggleGroupHost, { props: { orientation: 'vertical' } })
    const group = screen.getByRole('group', { name: 'Text alignment' })
    expect(group).toHaveAttribute('data-orientation', 'vertical')
    expect(group.className).toContain('data-[orientation=vertical]:flex-col')
  })

  it('forwards class', () => {
    render(ToggleGroupHost, { props: { class: 'custom-class' } })
    expect(screen.getByRole('group', { name: 'Text alignment' }).className).toContain('custom-class')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(ToggleGroupHost, { props: { defaultValue: 'left' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
