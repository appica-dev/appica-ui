import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import OTPFieldHost from './otp-field.test-host.svelte'

const LENGTH = 4

describe('OTPField', () => {
  it('renders the requested number of slots', () => {
    render(OTPFieldHost)
    expect(document.querySelectorAll('[data-slot="otp-field-input"]')).toHaveLength(LENGTH)
  })

  it('accepts user typing and updates the hidden input', async () => {
    const user = userEvent.setup()
    render(OTPFieldHost)
    const input = screen.getByLabelText('Verification code')
    input.focus()
    await user.keyboard('1234')
    expect((input as HTMLInputElement).value).toBe('1234')
  })

  it('disables the hidden input when disabled', () => {
    render(OTPFieldHost, { props: { disabled: true } })
    expect(screen.getByLabelText('Verification code')).toBeDisabled()
  })

  it('applies the size class to slots', () => {
    render(OTPFieldHost, { props: { size: 'lg' } })
    const first = document.querySelector('[data-slot="otp-field-input"]')
    expect(first?.className).toContain('h-12')
    expect(first?.className).toContain('w-12')
  })

  it('applies the variant class to slots', () => {
    render(OTPFieldHost, { props: { variant: 'soft' } })
    expect(document.querySelector('[data-slot="otp-field-input"]')?.className).toContain('bg-background-muted')
  })

  it('marks slots invalid inside Field', () => {
    render(OTPFieldHost, { props: { invalid: true } })
    expect(document.querySelector('[data-slot="otp-field"]')).toHaveAttribute('data-invalid')
    expect(document.querySelector('[data-slot="otp-field-input"]')).toHaveAttribute('data-invalid')
  })

  it('renders a separator between slot groups', () => {
    render(OTPFieldHost)
    expect(document.querySelector('[data-slot="otp-field-separator"]')).not.toBeNull()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(OTPFieldHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
