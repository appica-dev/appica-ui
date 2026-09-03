import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import FormHost from './form.test-host.svelte'

describe('Form', () => {
  it('renders a native form element', () => {
    render(FormHost)

    const form = screen.getByRole('form', { name: 'signup' })
    expect(form.tagName).toBe('FORM')
    expect(form).toHaveAttribute('data-slot', 'form')
  })

  it('forwards onsubmit', async () => {
    const onsubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    render(FormHost, { props: { onsubmit } })

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(onsubmit).toHaveBeenCalledTimes(1)
  })

  it('has no accessibility violations', async () => {
    const { container } = render(FormHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
