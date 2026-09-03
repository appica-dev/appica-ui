import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import TabsHost from './tabs.test-host.svelte'

describe('Tabs', () => {
  it('renders composition with default-active panel visible', () => {
    render(TabsHost)
    expect(screen.getByRole('tablist')).toHaveAttribute('data-slot', 'tabs-list')
    const triggers = screen.getAllByRole('tab')
    expect(triggers).toHaveLength(3)
    expect(triggers[0]).toHaveAttribute('aria-selected', 'true')
    expect(triggers[1]).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('Panel One')).toBeVisible()
  })

  it('switches the active panel on click', async () => {
    const user = userEvent.setup()
    render(TabsHost)

    await user.click(screen.getByRole('tab', { name: 'Two' }))

    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('Panel Two')).toBeVisible()
  })

  it('honors defaultValue', () => {
    render(TabsHost, { props: { defaultValue: 'three' } })
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Panel Three')).toBeVisible()
  })

  it('does not activate a disabled trigger', async () => {
    const user = userEvent.setup()
    render(TabsHost, { props: { secondDisabled: true } })
    await user.click(screen.getByRole('tab', { name: 'Two' }))
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders a sliding indicator', () => {
    render(TabsHost)
    expect(document.querySelector('[data-slot="tabs-indicator"]')).not.toBeNull()
  })

  it('moves focus with arrow keys', async () => {
    const user = userEvent.setup()
    render(TabsHost)
    screen.getByRole('tab', { name: 'One' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(TabsHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
