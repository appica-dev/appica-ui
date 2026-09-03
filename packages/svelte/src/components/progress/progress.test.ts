import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import ProgressHost from './progress.test-host.svelte'
import Progress from './progress.svelte'

describe('Progress', () => {
  it('renders bar variant by default with role and value', () => {
    render(Progress, { props: { value: 40 } })
    const el = screen.getByRole('progressbar')
    expect(el).toHaveAttribute('data-slot', 'progress')
    expect(el).toHaveAttribute('data-variant', 'bar')
    expect(el).toHaveAttribute('aria-valuenow', '40')
    expect(el).toHaveAttribute('aria-valuemin', '0')
    expect(el).toHaveAttribute('aria-valuemax', '100')
  })

  it('renders bar Track and Indicator with width applied', () => {
    const { container } = render(Progress, { props: { value: 50 } })
    const track = container.querySelector('[data-slot=progress-track]') as HTMLElement
    const indicator = container.querySelector('[data-slot=progress-indicator]') as HTMLElement
    expect(track).toBeInTheDocument()
    expect(indicator).toBeInTheDocument()
    expect(indicator.style.width).toBe('50%')
  })

  it('applies thickness to bar track height', () => {
    const { container } = render(Progress, { props: { value: 20, thickness: 10 } })
    const track = container.querySelector('[data-slot=progress-track]') as HTMLElement
    expect(track.style.height).toBe('10px')
  })

  it('renders circular variant with an SVG', () => {
    const { container } = render(Progress, { props: { value: 75, variant: 'circular' } })
    const root = screen.getByRole('progressbar')
    expect(root).toHaveAttribute('data-variant', 'circular')
    const svg = container.querySelector('svg[data-slot=progress-circular]') as SVGElement
    expect(svg).toBeInTheDocument()
    expect(svg.getAttribute('width')).toBe('56')
    expect(svg.getAttribute('height')).toBe('56')
  })

  it('respects size and thickness on circular variant', () => {
    const { container } = render(Progress, { props: { value: 50, variant: 'circular', size: 80, thickness: 6 } })
    const svg = container.querySelector('svg[data-slot=progress-circular]') as SVGElement
    expect(svg.getAttribute('width')).toBe('80')
    const indicator = container.querySelector('svg [data-slot=progress-indicator]') as SVGCircleElement
    expect(indicator.getAttribute('stroke-width')).toBe('6')
  })

  it('passes indicatorColor through via the --progress-color CSS variable', () => {
    render(Progress, { props: { value: 50, indicatorColor: 'oklch(0.7 0.2 30)' } })
    const root = screen.getByRole('progressbar')
    expect(root.style.getPropertyValue('--progress-color')).toBe('oklch(0.7 0.2 30)')
  })

  it('links ProgressLabel to the root via aria-labelledby', () => {
    render(ProgressHost, { props: { value: 10, showLabel: true, label: 'Uploading' } })
    const root = screen.getByRole('progressbar')
    const labelledBy = root.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(document.getElementById(labelledBy!)?.textContent).toBe('Uploading')
  })

  it('renders the formatted value via ProgressValue', () => {
    render(ProgressHost, { props: { value: 42, showValue: true } })
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('formats ProgressValue and aria-valuetext with format and locale', () => {
    render(ProgressHost, {
      props: {
        value: 60,
        showValue: true,
        format: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
        locale: 'en-US',
      },
    })
    expect(screen.getByText('60.0%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '60.0%')
  })

  it('uses getAriaValueText for aria-valuetext without changing ProgressValue', () => {
    render(ProgressHost, {
      props: {
        value: 40,
        showValue: true,
        getAriaValueText: (formatted, current) => `${current} of 100 (${formatted})`,
      },
    })
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '40 of 100 (40%)')
  })

  it('passes formatted text and the numeric value to a custom ProgressValue snippet', () => {
    render(ProgressHost, { props: { value: 42, customValue: true } })
    expect(screen.getByText('42 (42%)')).toBeInTheDocument()
  })

  it('marks complete state on parts when value reaches max', () => {
    const { container } = render(Progress, { props: { value: 100 } })
    const root = screen.getByRole('progressbar')
    const indicator = container.querySelector('[data-slot=progress-indicator]') as HTMLElement
    expect(root).toHaveAttribute('data-complete')
    expect(root).not.toHaveAttribute('data-progressing')
    expect(indicator).toHaveAttribute('data-complete')
  })

  it('marks progressing on the root when value is below max', () => {
    render(Progress, { props: { value: 40 } })
    const root = screen.getByRole('progressbar')
    expect(root).toHaveAttribute('data-progressing')
    expect(root).not.toHaveAttribute('data-complete')
  })

  it('forwards class alongside the layout classes', () => {
    render(Progress, { props: { value: 50, class: 'custom-class' } })
    const root = screen.getByRole('progressbar')
    expect(root.className).toContain('custom-class')
    expect(root.className).toContain('grid')
  })

  it('has no accessibility violations (bar)', async () => {
    const { container } = render(ProgressHost, {
      props: { value: 60, showLabel: true, label: 'Loading', showValue: true },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations (circular)', async () => {
    const { container } = render(ProgressHost, {
      props: { value: 60, variant: 'circular', showLabel: true, label: 'Loading', showValue: true },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
