import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import TableHost from './table.test-host.svelte'

describe('Table', () => {
  it('renders the full semantic composition', () => {
    render(TableHost)
    const table = screen.getByRole('table')
    expect(table).toHaveAttribute('data-slot', 'table')
    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
    expect(screen.getAllByRole('row')).toHaveLength(4)
    expect(screen.getAllByRole('cell')).toHaveLength(9)
  })

  it('applies size padding via parent descendant selectors', () => {
    const { rerender } = render(TableHost, { props: { size: 'sm' } })
    expect(screen.getByRole('table').className).toContain('[&_td]:p-3')
    expect(screen.getByRole('table').className).toContain('p-1 ')

    rerender({ size: 'md' })
    expect(screen.getByRole('table').className).toContain('[&_td]:p-3.5')

    rerender({ size: 'lg' })
    expect(screen.getByRole('table').className).toContain('[&_td]:p-4')
    expect(screen.getByRole('table').className).toContain('p-1.5')
  })

  it('applies dashed border style on body cells via parent selector', () => {
    render(TableHost, { props: { borderStyle: 'dashed' } })
    const className = screen.getByRole('table').className
    expect(className).toContain('[&_td]:border-dashed')
    expect(className).toContain('[&_td]:border-border-strong')
  })

  it('strips cell borders when borderStyle="none"', () => {
    render(TableHost, { props: { borderStyle: 'none' } })
    const className = screen.getByRole('table').className
    expect(className).toContain('[&_td]:border-b-0')
    expect(className).toContain('[&>tbody_th]:border-b-0')
  })

  it('toggles data-highlighted on the row when highlighted prop is set', () => {
    render(TableHost)
    const rows = screen.getAllByRole('row')
    expect(rows[2]).toHaveAttribute('data-highlighted', '')
    expect(rows[1]).not.toHaveAttribute('data-highlighted')
    expect(rows[3]).not.toHaveAttribute('data-highlighted')
  })

  it('opts into striped rows only when stripedRows is set', () => {
    const { rerender } = render(TableHost)
    expect(screen.getByRole('table').className).not.toContain('[&>tbody>tr:nth-child(2n)]:bg-background-subtle')

    rerender({ stripedRows: true })
    expect(screen.getByRole('table').className).toContain('[&>tbody>tr:nth-child(2n)]:bg-background-subtle')
  })

  it('opts into striped columns only when stripedColumns is set', () => {
    const { rerender } = render(TableHost)
    expect(screen.getByRole('table').className).not.toContain('[&>tbody>tr>:nth-child(2n)]:bg-background-subtle')

    rerender({ stripedColumns: true })
    expect(screen.getByRole('table').className).toContain('[&>tbody>tr>:nth-child(2n)]:bg-background-subtle')
  })

  it('opts into row hover styling only when hoverableRows is set', () => {
    const { rerender } = render(TableHost)
    expect(screen.getByRole('table').className).not.toContain('[&>tbody>tr:hover]:bg-background-subtle')

    rerender({ hoverableRows: true })
    expect(screen.getByRole('table').className).toContain('[&>tbody>tr:hover]:bg-background-subtle')
  })

  it('applies bottom inner-radius classes to last body row cells', () => {
    render(TableHost, { props: { size: 'md' } })
    const className = screen.getByRole('table').className
    expect(className).toContain('[&>tbody:last-of-type>tr:last-child>:first-child]:rounded-es-md')
    expect(className).toContain('[&>tbody:last-of-type>tr:last-child>:last-child]:rounded-ee-md')
  })

  it('keeps top inner-radius classes ready for the no-header case', () => {
    render(TableHost, { props: { size: 'md' } })
    const className = screen.getByRole('table').className
    expect(className).toContain('[&:not(:has(thead))>tbody:first-of-type>tr:first-child>:first-child]:rounded-ss-md')
  })

  it('applies header pill background and corner classes', () => {
    render(TableHost, { props: { size: 'md' } })
    const className = screen.getByRole('table').className
    expect(className).toContain('[&>thead>tr>th]:bg-background-muted')
    expect(className).toContain('[&>thead>tr:first-child>th:first-child]:rounded-ss-md')
    expect(className).toContain('[&>thead>tr:last-child>th:last-child]:rounded-ee-md')
  })

  it('renders th scope="row" inside tbody as a row-header cell', () => {
    render(TableHost, { props: { rowHeader: true } })
    expect(screen.getByRole('rowheader', { name: 'Monday' })).toBeInTheDocument()
  })

  it('places the caption above when position="top"', () => {
    render(TableHost, { props: { captionPosition: 'top' } })
    const caption = screen.getByText('Recent transactions')
    expect(caption.tagName).toBe('CAPTION')
    expect(caption.className).toContain('caption-top')
  })

  it('emits data-slot on each sub-component', () => {
    render(TableHost)
    expect(screen.getByRole('table')).toHaveAttribute('data-slot', 'table')
    expect(screen.getByText('Recent transactions')).toHaveAttribute('data-slot', 'table-caption')
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('data-slot', 'table-head')
    expect(screen.getAllByRole('cell')[0]).toHaveAttribute('data-slot', 'table-cell')
    expect(screen.getAllByRole('row')[1]).toHaveAttribute('data-slot', 'table-row')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(TableHost)
    expect(await axe(container)).toHaveNoViolations()
  })
})
