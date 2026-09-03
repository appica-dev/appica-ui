import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import FieldHost from './field.test-host.svelte'
import FieldFormHost from './field.form-host.svelte'

describe('Field', () => {
  it('associates the label with the control', () => {
    render(FieldHost)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('describes the control via aria-describedby', () => {
    render(FieldHost, { props: { description: true } })
    const control = screen.getByLabelText('Email')
    const description = screen.getByText('We never share your email.')
    expect(control).toHaveAttribute('aria-describedby', expect.stringContaining(description.id))
  })

  it('shows an error message when invalid', () => {
    render(FieldHost, { props: { invalid: true, error: 'Email is required' } })
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('hides the error message when valid', () => {
    render(FieldHost, { props: { error: 'Email is required' } })
    expect(screen.queryByText('Email is required')).toBeNull()
  })

  it('exposes validity state via FieldValidity', () => {
    render(FieldHost, { props: { invalid: true, showValidity: true } })
    expect(screen.getByTestId('valid')).toHaveTextContent('false')
  })

  it('marks a nested Input as invalid', () => {
    render(FieldHost, { props: { invalid: true } })
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('data-invalid')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows Form errors keyed by name', () => {
    render(FieldFormHost)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('data-invalid')
  })

  it('clears Form errors when the nested control changes', async () => {
    const user = userEvent.setup()
    render(FieldFormHost)
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Email'), 'a')
    expect(screen.queryByText('Email is required')).toBeNull()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(FieldHost, { props: { description: true } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
