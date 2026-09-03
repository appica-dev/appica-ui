import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import ToolbarHost from './toolbar.test-host.svelte'

describe('Toolbar', () => {
  it('renders a toolbar with its items', () => {
    render(ToolbarHost)
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' })
    expect(toolbar).toHaveAttribute('data-slot', 'toolbar')
    expect(screen.getByRole('group', { name: 'Text style' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute('href', '#help')
  })

  it('styles ToolbarButton via buttonVariants on class', () => {
    render(ToolbarHost)
    const bold = screen.getByRole('button', { name: 'Bold' })
    expect(bold.tagName).toBe('BUTTON')
    expect(bold.className).toContain('text-foreground-emphasis')
  })

  it('renders a separator flipped perpendicular to the toolbar', () => {
    render(ToolbarHost)
    expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'vertical')
  })

  it('moves focus between items with arrow keys (roving tabindex)', async () => {
    const user = userEvent.setup()
    render(ToolbarHost)

    const bold = screen.getByRole('button', { name: 'Bold' })
    bold.focus()
    expect(bold).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('button', { name: 'Italic' })).toHaveFocus()
  })

  it('applies vertical orientation', () => {
    render(ToolbarHost, { props: { orientation: 'vertical' } })
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' })
    expect(toolbar).toHaveAttribute('data-orientation', 'vertical')
    expect(toolbar.className).toContain('data-[orientation=vertical]:flex-col')
    expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('disables items when the toolbar is disabled', () => {
    render(ToolbarHost, { props: { disabled: true } })
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('data-disabled')
  })

  it('forwards class to the root', () => {
    render(ToolbarHost, { props: { class: 'custom-class' } })
    expect(screen.getByRole('toolbar', { name: 'Formatting' }).className).toContain('custom-class')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(ToolbarHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
