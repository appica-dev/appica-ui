import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { htmlSnippet } from '../../test/snippet'
import TextareaControlled from './textarea-controlled.test-host.svelte'
import Textarea from './textarea.svelte'

describe('Textarea', () => {
  it('renders with textbox role', () => {
    render(Textarea, { props: { 'aria-label': 'Bio' } })
    expect(screen.getByRole('textbox', { name: 'Bio' })).toBeInTheDocument()
  })

  it('accepts user typing across multiple lines', async () => {
    const user = userEvent.setup()
    render(Textarea, { props: { 'aria-label': 'Notes' } })
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'line one{enter}line two')
    expect(textarea).toHaveValue('line one\nline two')
  })

  it('calls oninput when typing in a controlled textarea', async () => {
    const user = userEvent.setup()
    const onValue = vi.fn()
    render(TextareaControlled, { props: { onValue } })
    await user.type(screen.getByRole('textbox'), 'hi')
    expect(onValue).toHaveBeenLastCalledWith('hi')
    expect(screen.getByRole('textbox')).toHaveValue('hi')
  })

  it('is disabled when the disabled prop is set', async () => {
    const user = userEvent.setup()
    render(Textarea, { props: { 'aria-label': 'Disabled', disabled: true } })
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
    await user.type(textarea, 'x')
    expect(textarea).toHaveValue('')
  })

  it('applies size padding-y classes', () => {
    render(Textarea, { props: { 'aria-label': 'Large', inputSize: 'lg' } })
    expect(screen.getByRole('textbox').className).toContain('py-3')
  })

  it('applies variant classes', () => {
    render(Textarea, { props: { 'aria-label': 'Soft', variant: 'soft' } })
    expect(screen.getByRole('textbox').className).toContain('bg-background-muted')
  })

  it('overrides h-X from inputVariants so rows controls height', () => {
    render(Textarea, { props: { 'aria-label': 'Rows', rows: 5 } })
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
    expect(textarea.className).toContain('h-auto')
    expect(textarea.className).not.toMatch(/(?:^|\s)h-(?:8|10|12)(?:\s|$)/)
  })

  it('enforces a per-size min-height floor on the textarea', () => {
    render(Textarea, { props: { 'aria-label': 'Min height', inputSize: 'md' } })
    expect(screen.getByRole('textbox').className).toContain('min-h-20')
  })

  it('wrapper owns the resize handle and seeds height from rows', () => {
    render(Textarea, {
      props: { 'aria-label': 'Wrapped', rows: 6, start: htmlSnippet('<span data-testid="s">@</span>') },
    })
    const wrapper = screen.getByTestId('s').closest('[data-slot="textarea-wrapper"]') as HTMLElement
    expect(wrapper.className).toContain('resize-y')
    expect(wrapper.className).toContain('h-(--textarea-h)')
    expect(wrapper.className).toContain('min-h-20')
    expect(wrapper.className).not.toMatch(/(?:^|\s)h-(?:8|10|12)(?:\s|$)/)
    expect(wrapper.style.getPropertyValue('--textarea-h')).toBe('calc(6 * 1lh + 2 * 0.625rem + 2px)')

    const textarea = screen.getByRole('textbox')
    expect(textarea.className).toContain('resize-none')
    expect(textarea.className).toContain('self-stretch')
  })

  it('bare disabled textarea carries data-disabled so it picks up data-disabled: classes from inputVariants', () => {
    render(Textarea, { props: { 'aria-label': 'Disabled style', disabled: true } })
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('data-disabled')
    expect(textarea.className).toContain('data-disabled:border-dashed')
  })

  it('bare textarea omits data-disabled when not disabled', () => {
    render(Textarea, { props: { 'aria-label': 'Enabled' } })
    expect(screen.getByRole('textbox')).not.toHaveAttribute('data-disabled')
  })

  it('bridges aria-invalid to data-invalid on the bare textarea', () => {
    render(Textarea, { props: { 'aria-label': 'Notes', 'aria-invalid': true } })
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveAttribute('data-invalid')
  })

  it('bridges aria-invalid to data-invalid on the wrapper when slots are present', () => {
    const { container } = render(Textarea, {
      props: { 'aria-label': 'Notes', 'aria-invalid': true, end: htmlSnippet('<span>@</span>') },
    })
    expect(container.querySelector('[data-slot="textarea-wrapper"]')).toHaveAttribute('data-invalid')
  })

  it('bare textarea omits data-invalid when valid', () => {
    render(Textarea, { props: { 'aria-label': 'Enabled' } })
    expect(screen.getByRole('textbox')).not.toHaveAttribute('data-invalid')
  })

  it('renders the clear button when clearable and clears the value', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(Textarea, { props: { 'aria-label': 'Notes', clearable: true, onClear } })

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'hello')
    expect(textarea).toHaveValue('hello')

    await user.click(screen.getByRole('button', { name: 'Clear input' }))
    expect(textarea).toHaveValue('')
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('renders start and end snippets when provided', () => {
    render(Textarea, {
      props: {
        'aria-label': 'With slots',
        start: htmlSnippet('<span data-testid="start">@</span>'),
        end: htmlSnippet('<span data-testid="end">md</span>'),
      },
    })
    expect(screen.getByTestId('start')).toBeInTheDocument()
    expect(screen.getByTestId('end')).toBeInTheDocument()
  })

  it('aligns slots to the top with line-height matched wrapper', () => {
    render(Textarea, { props: { 'aria-label': 'Slot align', start: htmlSnippet('<span data-testid="start">@</span>') } })
    const startWrapper = screen.getByTestId('start').parentElement
    expect(startWrapper?.className).toContain('h-lh')
    expect(startWrapper?.className).toContain('items-center')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Textarea, { props: { 'aria-label': 'Bio' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
