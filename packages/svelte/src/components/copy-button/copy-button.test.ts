import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { textSnippet } from '../../test/snippet'
import CopyButtonSourceHost from './copy-button-source.test-host.svelte'
import CopyButton from './copy-button.svelte'

function setup() {
  const user = userEvent.setup()
  const writeText = vi.spyOn(navigator.clipboard, 'writeText')
  return { user, writeText }
}

describe('CopyButton', () => {
  it('renders a button with an accessible name', () => {
    render(CopyButton, { props: { value: 'hello' } })
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('renders a visible label alongside the icon when children are passed', () => {
    render(CopyButton, { props: { value: 'hello', children: textSnippet('Copy SVG') } })
    expect(screen.getByText('Copy SVG')).toBeInTheDocument()
  })

  it('swaps a string label to the copied label on success', async () => {
    const { user } = setup()
    render(CopyButton, { props: { value: 'hello', copiedLabel: 'Copied', children: textSnippet('Copy SVG') } })

    await user.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.queryByText('Copy SVG')).not.toBeInTheDocument())
    expect(screen.getAllByText('Copied').length).toBeGreaterThanOrEqual(1)
  })

  it('copies the string value on click', async () => {
    const { user, writeText } = setup()
    const onCopy = vi.fn()
    render(CopyButton, { props: { value: 'hello', onCopy } })

    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith('hello')
    expect(onCopy).toHaveBeenCalledWith('hello')
  })

  it('resolves a function value, including async ones', async () => {
    const { user, writeText } = setup()
    render(CopyButton, { props: { value: async () => 'computed' } })

    await user.click(screen.getByRole('button'))

    expect(writeText).toHaveBeenCalledWith('computed')
  })

  it('copies the value of a referenced input', async () => {
    const { user, writeText } = setup()
    render(CopyButtonSourceHost, { props: { kind: 'input' } })

    await waitFor(() => expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith('from input')
  })

  it('copies the textContent of a referenced element', async () => {
    const { user, writeText } = setup()
    render(CopyButtonSourceHost, { props: { kind: 'pre' } })

    await waitFor(() => expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith('npm install appica')
  })

  it('switches to the copied state and reverts after the timeout', async () => {
    const { user } = setup()
    render(CopyButton, { props: { value: 'hello', timeout: 50 } })

    const button = screen.getByRole('button', { name: 'Copy' })
    await user.click(button)
    expect(button).toHaveAccessibleName('Copied')

    await waitFor(() => expect(button).toHaveAccessibleName('Copy'))
  })

  it('uses custom labels for the accessible name', async () => {
    const { user } = setup()
    render(CopyButton, { props: { value: 'hello', label: 'Copy code', copiedLabel: 'Code copied' } })

    const button = screen.getByRole('button', { name: 'Copy code' })
    await user.click(button)
    expect(button).toHaveAccessibleName('Code copied')
  })

  it('reports failures via onCopyError and stays idle', async () => {
    const { user, writeText } = setup()
    const error = new Error('denied')
    writeText.mockRejectedValueOnce(error)
    const onCopy = vi.fn()
    const onCopyError = vi.fn()
    render(CopyButton, { props: { value: 'hello', onCopy, onCopyError } })

    const button = screen.getByRole('button', { name: 'Copy' })
    await user.click(button)

    expect(onCopyError).toHaveBeenCalledWith(error)
    expect(onCopy).not.toHaveBeenCalled()
    expect(button).toHaveAccessibleName('Copy')
  })

  it('forwards button props', () => {
    render(CopyButton, { props: { value: 'hello', class: 'custom-class', disabled: true } })
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
    expect(button).toHaveAttribute('data-disabled')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(CopyButton, { props: { value: 'hello' } })
    expect(await axe(container)).toHaveNoViolations()
  })
})
