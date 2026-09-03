import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { htmlSnippet } from '../../test/snippet'
import InputControlled from './input-controlled.test-host.svelte'
import Input from './input.svelte'

describe('Input', () => {
  it('renders with textbox role', () => {
    render(Input, { props: { 'aria-label': 'Email' } })
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  })

  it('accepts user typing', async () => {
    const user = userEvent.setup()
    render(Input, { props: { 'aria-label': 'Name' } })
    const input = screen.getByRole('textbox')
    await user.type(input, 'Roman')
    expect(input).toHaveValue('Roman')
  })

  it('calls oninput when typing in a controlled input', async () => {
    const user = userEvent.setup()
    const onValue = vi.fn()
    render(InputControlled, { props: { onValue } })
    await user.type(screen.getByRole('textbox'), 'hi')
    expect(onValue).toHaveBeenLastCalledWith('hi')
    expect(screen.getByRole('textbox')).toHaveValue('hi')
  })

  it('is disabled when the disabled prop is set', async () => {
    const user = userEvent.setup()
    render(Input, { props: { 'aria-label': 'Disabled', disabled: true } })
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    await user.type(input, 'x')
    expect(input).toHaveValue('')
  })

  it('applies size classes', () => {
    render(Input, { props: { 'aria-label': 'Large', inputSize: 'lg' } })
    expect(screen.getByRole('textbox').className).toContain('h-12')
  })

  it('applies variant classes', () => {
    render(Input, { props: { 'aria-label': 'Soft', variant: 'soft' } })
    expect(screen.getByRole('textbox').className).toContain('bg-background-muted')
  })

  it('renders the clear button when clearable and clears the value', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(Input, { props: { 'aria-label': 'Search', clearable: true, onClear } })

    const input = screen.getByRole('textbox')
    await user.type(input, 'query')
    expect(input).toHaveValue('query')

    await user.click(screen.getByRole('button', { name: 'Clear input' }))
    expect(input).toHaveValue('')
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('renders start and end snippets when provided', () => {
    render(Input, {
      props: {
        'aria-label': 'With slots',
        start: htmlSnippet('<span data-testid="start">$</span>'),
        end: htmlSnippet('<span data-testid="end">USD</span>'),
      },
    })
    expect(screen.getByTestId('start')).toBeInTheDocument()
    expect(screen.getByTestId('end')).toBeInTheDocument()
  })

  it('bridges aria-invalid to data-invalid on the bare input', () => {
    const { container } = render(Input, { props: { 'aria-label': 'Email', 'aria-invalid': true } })
    const input = container.querySelector('[data-slot="input"]')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('data-invalid')
  })

  it('bridges aria-invalid to data-invalid on the wrapper when slots are present', () => {
    const { container } = render(Input, {
      props: { 'aria-label': 'Email', 'aria-invalid': true, end: htmlSnippet('<span>@</span>') },
    })
    expect(container.querySelector('[data-slot="input-wrapper"]')).toHaveAttribute('data-invalid')
  })

  it('does not set data-invalid when valid', () => {
    const { container } = render(Input, { props: { 'aria-label': 'Email' } })
    expect(container.querySelector('[data-slot="input"]')).not.toHaveAttribute('data-invalid')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Input, { props: { 'aria-label': 'Email' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
