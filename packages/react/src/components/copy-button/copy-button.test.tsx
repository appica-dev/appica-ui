import * as React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { CopyButton } from './copy-button'

// userEvent.setup() installs its own navigator.clipboard stub, so the spy
// must be created after setup() - a beforeEach mock would get replaced.
function setup() {
  const user = userEvent.setup()
  const writeText = vi.spyOn(navigator.clipboard, 'writeText')
  return { user, writeText }
}

describe('CopyButton', () => {
  it('renders a button with an accessible name', () => {
    render(<CopyButton value="hello" />)
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
  })

  it('renders a visible label alongside the icon when children are passed', () => {
    render(<CopyButton value="hello">Copy SVG</CopyButton>)
    expect(screen.getByText('Copy SVG')).toBeInTheDocument()
  })

  it('swaps a string label to the copied label on success', async () => {
    const { user } = setup()
    render(
      <CopyButton value="hello" copiedLabel="Copied">
        Copy SVG
      </CopyButton>,
    )

    await user.click(screen.getByRole('button'))

    await waitFor(() => expect(screen.queryByText('Copy SVG')).not.toBeInTheDocument())
    // Both the visible label and the sr-only status announce "Copied".
    expect(screen.getAllByText('Copied').length).toBeGreaterThanOrEqual(1)
  })

  it('renders a custom resting icon in place of the copy glyph and still swaps to the check', async () => {
    const { user } = setup()
    render(<CopyButton value="hello" icon={<svg data-testid="link-icon" />} />)
    const button = screen.getByRole('button', { name: 'Copy' })
    expect(screen.getByTestId('link-icon')).toBeInTheDocument()
    expect(button.querySelectorAll('svg')).toHaveLength(2)

    await user.click(button)

    await waitFor(() => expect(button).toHaveAttribute('data-copied'))
    expect(screen.getByTestId('link-icon')).toBeInTheDocument()
  })

  it('copies the string value on click', async () => {
    const { user, writeText } = setup()
    const onCopy = vi.fn()
    render(<CopyButton value="hello" onCopy={onCopy} />)

    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith('hello')
    expect(onCopy).toHaveBeenCalledWith('hello')
  })

  it('resolves a function value, including async ones', async () => {
    const { user, writeText } = setup()
    render(<CopyButton value={async () => 'computed'} />)

    await user.click(screen.getByRole('button'))

    expect(writeText).toHaveBeenCalledWith('computed')
  })

  it('copies the value of a referenced input', async () => {
    const { user, writeText } = setup()
    function Demo() {
      const inputRef = React.useRef<HTMLInputElement>(null)
      return (
        <>
          <input ref={inputRef} defaultValue="from input" aria-label="Source" />
          <CopyButton value={inputRef} />
        </>
      )
    }
    render(<Demo />)

    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith('from input')
  })

  it('copies the textContent of a referenced element', async () => {
    const { user, writeText } = setup()
    function Demo() {
      const preRef = React.useRef<HTMLPreElement>(null)
      return (
        <>
          <pre ref={preRef}>
            <code>npm install appica</code>
          </pre>
          <CopyButton value={preRef} />
        </>
      )
    }
    render(<Demo />)

    await user.click(screen.getByRole('button', { name: 'Copy' }))

    expect(writeText).toHaveBeenCalledWith('npm install appica')
  })

  it('switches to the copied state and reverts after the timeout', async () => {
    const { user } = setup()
    render(<CopyButton value="hello" timeout={50} />)

    const button = screen.getByRole('button', { name: 'Copy' })
    await user.click(button)
    expect(button).toHaveAccessibleName('Copied')

    await waitFor(() => expect(button).toHaveAccessibleName('Copy'))
  })

  it('uses custom labels for the accessible name', async () => {
    const { user } = setup()
    render(<CopyButton value="hello" label="Copy code" copiedLabel="Code copied" />)

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
    render(<CopyButton value="hello" onCopy={onCopy} onCopyError={onCopyError} />)

    const button = screen.getByRole('button', { name: 'Copy' })
    await user.click(button)

    expect(onCopyError).toHaveBeenCalledWith(error)
    expect(onCopy).not.toHaveBeenCalled()
    expect(button).toHaveAccessibleName('Copy')
  })

  it('forwards button props', () => {
    render(<CopyButton value="hello" className="custom-class" disabled />)
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
    expect(button).toHaveAttribute('data-disabled')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<CopyButton value="hello" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
