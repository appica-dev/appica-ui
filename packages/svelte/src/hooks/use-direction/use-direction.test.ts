import { render, screen } from '@testing-library/svelte'
import { describe, expect, it } from 'vitest'
import DirectionReadHost from './use-direction.test-host.svelte'

describe('useDirection', () => {
  it('defaults to ltr with no provider', () => {
    render(DirectionReadHost)
    expect(screen.getByTestId('dir').textContent).toBe('ltr')
  })

  it('reads rtl from DirectionProvider', () => {
    render(DirectionReadHost, { props: { dir: 'rtl' } })
    expect(screen.getByTestId('dir').textContent).toBe('rtl')
  })
})
