import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import FieldsetHost from './fieldset.test-host.svelte'

describe('Fieldset', () => {
  it('renders a fieldset with an associated legend', () => {
    render(FieldsetHost)

    const group = screen.getByRole('group', { name: 'Account' })
    expect(group.tagName).toBe('FIELDSET')
    expect(group).toHaveAttribute('data-slot', 'fieldset')
    expect(screen.getByText('Account')).toHaveAttribute('data-slot', 'fieldset-legend')
  })

  it('forwards class to the root and legend', () => {
    render(FieldsetHost, { props: { class: 'root-x', legendClass: 'legend-x' } })

    const legend = screen.getByText('Account')
    expect(legend.className).toContain('legend-x')
    expect(screen.getByRole('group').className).toContain('root-x')
  })

  it('disables descendant controls when disabled', () => {
    render(FieldsetHost, { props: { disabled: true } })

    expect(screen.getByLabelText('Email')).toBeDisabled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(FieldsetHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
