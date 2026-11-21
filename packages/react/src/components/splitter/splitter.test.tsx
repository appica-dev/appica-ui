import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { Splitter, SplitterHandle, SplitterPanel, type SplitterPanelProps, type SplitterProps } from './splitter'
import { DirectionProvider } from '../../providers/direction-provider'
import { cssValue } from '../../test/css'

const RECT = { x: 0, y: 0, top: 0, left: 0, right: 200, bottom: 100, width: 200, height: 100 }

function stubSize() {
  vi.spyOn(HTMLDivElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ ...RECT, toJSON: () => RECT }) as DOMRect,
  )
}

function renderSplitter(
  props: Partial<SplitterProps> = {},
  first: Partial<SplitterPanelProps> = {},
  second: Partial<SplitterPanelProps> = {},
) {
  return render(
    <Splitter data-testid="root" {...props}>
      <SplitterPanel id="first" {...first}>
        First
      </SplitterPanel>
      <SplitterHandle aria-label="Resize first" />
      <SplitterPanel id="second" {...second}>
        Second
      </SplitterPanel>
    </Splitter>,
  )
}

const root = () => screen.getByTestId('root')
const handle = () => screen.getByRole('separator')
const panel = (id: string) => document.getElementById(id) as HTMLElement
const flex = (size: number) => cssValue('flex', `${size} 1 0px`)

async function press(keys: string) {
  const user = userEvent.setup()
  handle().focus()
  await user.keyboard(keys)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Splitter', () => {
  it('renders its parts with slots and the separator ARIA', () => {
    renderSplitter({ defaultSizes: [30, 70] }, { minSize: 10, maxSize: 80 })
    expect(root()).toHaveAttribute('data-slot', 'splitter')
    expect(root()).toHaveAttribute('data-orientation', 'horizontal')
    expect(panel('first')).toHaveAttribute('data-slot', 'splitter-panel')
    expect(handle()).toHaveAttribute('data-slot', 'splitter-handle')
    expect(handle()).toHaveAttribute('data-orientation', 'horizontal')
    expect(handle()).toHaveAttribute('tabindex', '0')
    expect(handle()).toHaveAttribute('aria-orientation', 'vertical')
    expect(handle()).toHaveAttribute('aria-valuenow', '30')
    expect(handle()).toHaveAttribute('aria-valuemin', '10')
    expect(handle()).toHaveAttribute('aria-valuemax', '80')
    expect(handle()).toHaveAttribute('aria-controls', 'first')
    expect(handle()).toHaveAttribute('data-base-ui-swipe-ignore', '')
  })

  it('reports the limits both neighboring panels allow', () => {
    renderSplitter({ defaultSizes: [30, 70] }, { minSize: 20 }, { minSize: 30, maxSize: 75 })
    expect(handle()).toHaveAttribute('aria-valuemin', '25')
    expect(handle()).toHaveAttribute('aria-valuemax', '70')
  })

  it('reports a horizontal separator when the panels stack vertically', () => {
    renderSplitter({ orientation: 'vertical' })
    expect(root()).toHaveAttribute('data-orientation', 'vertical')
    expect(handle()).toHaveAttribute('data-orientation', 'vertical')
    expect(handle()).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('gives each panel an id when none is passed', () => {
    render(
      <Splitter>
        <SplitterPanel data-testid="generated">A</SplitterPanel>
        <SplitterHandle aria-label="Resize" />
        <SplitterPanel>B</SplitterPanel>
      </Splitter>,
    )
    const id = screen.getByTestId('generated').id
    expect(id).not.toBe('')
    expect(handle()).toHaveAttribute('aria-controls', id)
  })

  it('splits evenly without defaultSizes', () => {
    render(
      <Splitter>
        <SplitterPanel id="a">A</SplitterPanel>
        <SplitterHandle aria-label="Resize A" />
        <SplitterPanel id="b">B</SplitterPanel>
        <SplitterHandle aria-label="Resize B" />
        <SplitterPanel id="c">C</SplitterPanel>
      </Splitter>,
    )
    for (const id of ['a', 'b', 'c']) expect(panel(id).style.flex).toBe(flex(100 / 3))
    const [left, right] = screen.getAllByRole('separator')
    expect(left).toHaveAttribute('aria-valuenow', '33')
    expect(left).toHaveAttribute('aria-controls', 'a')
    expect(right).toHaveAttribute('aria-controls', 'b')
  })

  it('applies defaultSizes, scaling them to 100 when they do not add up', () => {
    const { unmount } = renderSplitter({ defaultSizes: [30, 70] })
    expect(panel('first').style.flex).toBe(flex(30))
    expect(panel('second').style.flex).toBe(flex(70))
    unmount()

    renderSplitter({ defaultSizes: [1, 3] })
    expect(panel('first').style.flex).toBe(flex(25))
    expect(handle()).toHaveAttribute('aria-valuenow', '25')
  })

  it('lays the panels out from defaultSizes in server-rendered markup', () => {
    const container = document.createElement('div')
    container.innerHTML = renderToString(
      <Splitter defaultSizes={[30, 70]}>
        <SplitterPanel id="server-first">First</SplitterPanel>
        <SplitterHandle aria-label="Resize" />
        <SplitterPanel id="server-second">Second</SplitterPanel>
      </Splitter>,
    )
    expect(container.querySelector<HTMLElement>('#server-first')?.style.flex).toBe(flex(30))
    expect(container.querySelector<HTMLElement>('#server-second')?.style.flex).toBe(flex(70))
    expect(container.querySelector('[role="separator"]')).toHaveAttribute('aria-valuenow', '30')
  })

  it('moves with the arrow keys, clamped by both panels', async () => {
    const onSizesChange = vi.fn()
    const onSizesCommitted = vi.fn()
    renderSplitter({ onSizesChange, onSizesCommitted }, { minSize: 20, maxSize: 80 }, { minSize: 40 })

    await press('{ArrowRight}')
    expect(handle()).toHaveAttribute('aria-valuenow', '55')
    expect(onSizesChange).toHaveBeenLastCalledWith([55, 45])
    expect(onSizesCommitted).toHaveBeenLastCalledWith([55, 45])

    await press('{ArrowRight}{ArrowRight}')
    expect(handle()).toHaveAttribute('aria-valuenow', '60')
    expect(panel('second').style.flex).toBe(flex(40))
    expect(onSizesChange).toHaveBeenCalledTimes(2)

    await press('{ArrowLeft}'.repeat(10))
    expect(handle()).toHaveAttribute('aria-valuenow', '20')
  })

  it('stops at its own maxSize', async () => {
    renderSplitter({ keyboardStep: 10 }, { maxSize: 65 })
    await press('{ArrowRight}{ArrowRight}')
    expect(handle()).toHaveAttribute('aria-valuenow', '65')
  })

  it('jumps to the primary panel minimum with Home and its maximum with End', async () => {
    renderSplitter({}, { minSize: 10, maxSize: 70 }, { minSize: 20 })
    await press('{Home}')
    expect(handle()).toHaveAttribute('aria-valuenow', '10')
    await press('{End}')
    expect(handle()).toHaveAttribute('aria-valuenow', '70')
  })

  it('collapses a collapsible panel with Home, and toggles it with Enter', async () => {
    const onSizesCommitted = vi.fn()
    renderSplitter({ defaultSizes: [30, 70], onSizesCommitted }, { minSize: 20, collapsible: true })

    expect(handle()).toHaveAttribute('aria-valuemin', '0')
    expect(panel('first')).not.toHaveAttribute('data-collapsed')

    await press('{Enter}')
    expect(handle()).toHaveAttribute('aria-valuenow', '0')
    expect(panel('first')).toHaveAttribute('data-collapsed')
    expect(onSizesCommitted).toHaveBeenLastCalledWith([0, 100])

    await press('{Enter}')
    expect(handle()).toHaveAttribute('aria-valuenow', '30')
    expect(panel('first')).not.toHaveAttribute('data-collapsed')

    await press('{Home}')
    expect(panel('first')).toHaveAttribute('data-collapsed')
    await press('{ArrowRight}')
    expect(handle()).toHaveAttribute('aria-valuenow', '20')
  })

  it('ignores Enter on a panel that cannot collapse', async () => {
    const onSizesChange = vi.fn()
    renderSplitter({ onSizesChange })
    await press('{Enter}')
    expect(onSizesChange).not.toHaveBeenCalled()
  })

  it('inverts Left and Right in a right-to-left layout', async () => {
    render(
      <DirectionProvider dir="rtl">
        <Splitter>
          <SplitterPanel>A</SplitterPanel>
          <SplitterHandle aria-label="Resize" />
          <SplitterPanel>B</SplitterPanel>
        </Splitter>
      </DirectionProvider>,
    )
    await press('{ArrowLeft}')
    expect(handle()).toHaveAttribute('aria-valuenow', '55')
    await press('{ArrowRight}{ArrowRight}')
    expect(handle()).toHaveAttribute('aria-valuenow', '45')
  })

  it('moves with Up and Down when vertical, and ignores Left and Right', async () => {
    renderSplitter({ orientation: 'vertical' })
    await press('{ArrowDown}')
    expect(handle()).toHaveAttribute('aria-valuenow', '55')
    await press('{ArrowUp}{ArrowUp}')
    expect(handle()).toHaveAttribute('aria-valuenow', '45')
    await press('{ArrowRight}{ArrowLeft}')
    expect(handle()).toHaveAttribute('aria-valuenow', '45')
  })

  it('follows a pointer drag and commits once on release', async () => {
    stubSize()
    const onSizesChange = vi.fn()
    const onSizesCommitted = vi.fn()
    const user = userEvent.setup()
    renderSplitter({ onSizesChange, onSizesCommitted })

    await user.pointer([
      { keys: '[MouseLeft>]', target: handle(), coords: { clientX: 100, clientY: 50 } },
      { target: handle(), coords: { clientX: 120, clientY: 50 } },
      { target: handle(), coords: { clientX: 140, clientY: 50 } },
    ])
    expect(onSizesChange).toHaveBeenNthCalledWith(1, [60, 40])
    expect(onSizesChange).toHaveBeenNthCalledWith(2, [70, 30])
    expect(panel('first').style.flex).toBe(flex(70))
    expect(root()).toHaveAttribute('data-dragging')
    expect(handle()).toHaveAttribute('data-dragging')
    expect(onSizesCommitted).not.toHaveBeenCalled()

    await user.pointer({ keys: '[/MouseLeft]', target: handle() })
    expect(onSizesCommitted).toHaveBeenCalledExactlyOnceWith([70, 30])
    expect(root()).not.toHaveAttribute('data-dragging')
    expect(handle()).not.toHaveAttribute('data-dragging')
  })

  it('drags the other way in a right-to-left layout, and along the height when vertical', async () => {
    stubSize()
    const user = userEvent.setup()
    const { unmount } = render(
      <DirectionProvider dir="rtl">
        <Splitter>
          <SplitterPanel>A</SplitterPanel>
          <SplitterHandle aria-label="Resize" />
          <SplitterPanel>B</SplitterPanel>
        </Splitter>
      </DirectionProvider>,
    )
    await user.pointer([
      { keys: '[MouseLeft>]', target: handle(), coords: { clientX: 100, clientY: 50 } },
      { target: handle(), coords: { clientX: 80, clientY: 50 } },
      { keys: '[/MouseLeft]', target: handle() },
    ])
    expect(handle()).toHaveAttribute('aria-valuenow', '60')
    unmount()

    renderSplitter({ orientation: 'vertical' })
    await user.pointer([
      { keys: '[MouseLeft>]', target: handle(), coords: { clientX: 100, clientY: 50 } },
      { target: handle(), coords: { clientX: 180, clientY: 60 } },
      { keys: '[/MouseLeft]', target: handle() },
    ])
    expect(handle()).toHaveAttribute('aria-valuenow', '60')
  })

  it('snaps a collapsible panel shut past half its minSize, and open again past minSize', async () => {
    stubSize()
    const onSizesCommitted = vi.fn()
    const user = userEvent.setup()
    renderSplitter({ defaultSizes: [40, 60], onSizesCommitted }, { minSize: 20, collapsible: true })

    await user.pointer([
      { keys: '[MouseLeft>]', target: handle(), coords: { clientX: 80, clientY: 50 } },
      { target: handle(), coords: { clientX: 30, clientY: 50 } },
    ])
    expect(handle()).toHaveAttribute('aria-valuenow', '20')
    expect(panel('first')).not.toHaveAttribute('data-collapsed')

    await user.pointer({ target: handle(), coords: { clientX: 18, clientY: 50 } })
    expect(handle()).toHaveAttribute('aria-valuenow', '0')
    expect(panel('first')).toHaveAttribute('data-collapsed')

    await user.pointer({ target: handle(), coords: { clientX: 36, clientY: 50 } })
    expect(panel('first')).toHaveAttribute('data-collapsed')

    await user.pointer({ target: handle(), coords: { clientX: 50, clientY: 50 } })
    expect(handle()).toHaveAttribute('aria-valuenow', '25')
    expect(panel('first')).not.toHaveAttribute('data-collapsed')

    await user.pointer({ keys: '[/MouseLeft]', target: handle() })
    expect(onSizesCommitted).toHaveBeenCalledExactlyOnceWith([25, 75])
  })

  it('restores the size a drag collapsed from with Enter', async () => {
    stubSize()
    const user = userEvent.setup()
    renderSplitter({ defaultSizes: [40, 60] }, { minSize: 20, collapsible: true })

    await user.pointer([
      { keys: '[MouseLeft>]', target: handle(), coords: { clientX: 80, clientY: 50 } },
      { target: handle(), coords: { clientX: 0, clientY: 50 } },
      { keys: '[/MouseLeft]', target: handle() },
    ])
    expect(panel('first')).toHaveAttribute('data-collapsed')
    await press('{Enter}')
    expect(handle()).toHaveAttribute('aria-valuenow', '40')
  })

  it('does not commit a press that never moves', async () => {
    stubSize()
    const onSizesCommitted = vi.fn()
    const user = userEvent.setup()
    renderSplitter({ onSizesCommitted })
    await user.pointer({ keys: '[MouseLeft]', target: handle(), coords: { clientX: 100, clientY: 50 } })
    expect(onSizesCommitted).not.toHaveBeenCalled()
  })

  it('reports changes but follows only the sizes prop while controlled', async () => {
    const onSizesChange = vi.fn()
    const { rerender } = renderSplitter({ sizes: [40, 60], onSizesChange })

    await press('{ArrowRight}')
    expect(onSizesChange).toHaveBeenCalledWith([45, 55])
    expect(handle()).toHaveAttribute('aria-valuenow', '40')
    expect(panel('first').style.flex).toBe(flex(40))

    rerender(
      <Splitter sizes={[45, 55]}>
        <SplitterPanel id="first">First</SplitterPanel>
        <SplitterHandle aria-label="Resize first" />
        <SplitterPanel id="second">Second</SplitterPanel>
      </Splitter>,
    )
    expect(handle()).toHaveAttribute('aria-valuenow', '45')
    expect(panel('first').style.flex).toBe(flex(45))
  })

  it('reads panels in DOM order, including ones rendered by a wrapper or toggled off', () => {
    function Sidebar() {
      return <SplitterPanel id="sidebar">Sidebar</SplitterPanel>
    }
    function Layout({ preview }: { preview: boolean }) {
      return (
        <Splitter defaultSizes={[20, 50, 30]}>
          <Sidebar />
          <SplitterHandle aria-label="Resize sidebar" />
          <SplitterPanel id="main">Main</SplitterPanel>
          {preview ? <SplitterHandle aria-label="Resize main" /> : null}
          {preview ? <SplitterPanel id="preview">Preview</SplitterPanel> : null}
        </Splitter>
      )
    }

    const { rerender } = render(<Layout preview />)
    expect(screen.getByRole('separator', { name: 'Resize sidebar' })).toHaveAttribute('aria-controls', 'sidebar')
    expect(screen.getByRole('separator', { name: 'Resize main' })).toHaveAttribute('aria-controls', 'main')
    expect(panel('sidebar').style.flex).toBe(flex(20))
    expect(panel('main').style.flex).toBe(flex(50))

    rerender(<Layout preview={false} />)
    expect(screen.getAllByRole('separator')).toHaveLength(1)
    expect(panel('sidebar').style.flex).toBe(flex((20 * 100) / 70))
    expect(panel('main').style.flex).toBe(flex((50 * 100) / 70))
  })

  it('renders a grip when asked', () => {
    render(
      <Splitter>
        <SplitterPanel>A</SplitterPanel>
        <SplitterHandle aria-label="Resize" grip />
        <SplitterPanel>B</SplitterPanel>
      </Splitter>,
    )
    expect(handle().querySelector('[data-slot="splitter-grip"]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('throws outside a Splitter', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<SplitterPanel />)).toThrow('<SplitterPanel> must be used within <Splitter>')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Splitter defaultSizes={[25, 50, 25]}>
        <SplitterPanel minSize={10} collapsible>
          Files
        </SplitterPanel>
        <SplitterHandle aria-label="Resize files" grip />
        <SplitterPanel>
          <Splitter orientation="vertical">
            <SplitterPanel>Editor</SplitterPanel>
            <SplitterHandle aria-label="Resize editor" />
            <SplitterPanel>Terminal</SplitterPanel>
          </Splitter>
        </SplitterPanel>
        <SplitterHandle aria-label="Resize editor area" />
        <SplitterPanel>Outline</SplitterPanel>
      </Splitter>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
