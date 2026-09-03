import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import RadioGroupHost from './radio-group.test-host.svelte'

describe('RadioGroup', () => {
  it('renders with radiogroup role', () => {
    render(RadioGroupHost)
    expect(screen.getByRole('radiogroup', { name: 'Channel' })).toBeInTheDocument()
  })

  it('lays out vertically by default', () => {
    render(RadioGroupHost, { props: { testId: 'group' } })
    const group = screen.getByTestId('group')
    expect(group.className).toContain('flex-col')
    expect(group).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('lays out horizontally when orientation="horizontal"', () => {
    render(RadioGroupHost, { props: { orientation: 'horizontal', testId: 'group' } })
    const group = screen.getByTestId('group')
    expect(group.className).toContain('flex-wrap')
    expect(group.className).not.toContain('flex-col')
    expect(group).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('selects on click and fires onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(RadioGroupHost, { props: { onValueChange } })

    await user.click(screen.getByRole('radio', { name: 'SMS' }))
    expect(onValueChange).toHaveBeenCalledWith('sms')
    expect(screen.getByRole('radio', { name: 'SMS' })).toBeChecked()
  })

  it('lets consumer class override default display via tailwind-merge', () => {
    render(RadioGroupHost, { props: { class: 'grid grid-cols-2', testId: 'group' } })
    const group = screen.getByTestId('group')
    expect(group.className).toContain('grid')
    expect(group.className).toContain('grid-cols-2')
    expect(group.className).not.toMatch(/(^|\s)flex(\s|$)/)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(RadioGroupHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
