import * as React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { cn, composeRefs, useComposedRefs } from './utils'

describe('cn', () => {
  it('treats ease-spring as a timing function, so a later ease-* replaces it', () => {
    expect(cn('ease-spring', 'ease-linear')).toBe('ease-linear')
    expect(cn('motion-safe:ease-out', 'motion-safe:ease-spring')).toBe('motion-safe:ease-spring')
  })
})

describe('composeRefs', () => {
  it('assigns a node to object refs and calls function refs', () => {
    const objectRef = React.createRef<HTMLDivElement>()
    const fnRef = vi.fn()
    const node = document.createElement('div')

    composeRefs(objectRef, fnRef)(node)

    expect(objectRef.current).toBe(node)
    expect(fnRef).toHaveBeenCalledWith(node)
  })

  it('propagates a cleanup returned by an inner callback ref', () => {
    const cleanup = vi.fn()
    const fnRef = vi.fn(() => cleanup)
    const node = document.createElement('div')

    const composed = composeRefs<HTMLDivElement>(fnRef)
    const composedCleanup = composed(node)

    expect(typeof composedCleanup).toBe('function')
    composedCleanup?.()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('calls legacy refs with null when a sibling ref uses cleanup style', () => {
    const legacy = vi.fn()
    const cleanup = vi.fn()
    const cleanupRef = vi.fn(() => cleanup)
    const node = document.createElement('div')

    const composedCleanup = composeRefs<HTMLDivElement>(legacy, cleanupRef)(node)
    composedCleanup?.()

    expect(legacy).toHaveBeenCalledWith(node)
    expect(legacy).toHaveBeenLastCalledWith(null)
    expect(cleanup).toHaveBeenCalledTimes(1)
  })
})

describe('useComposedRefs', () => {
  it('does not re-invoke a consumer ref on an unrelated re-render', () => {
    const consumerRef = vi.fn()

    function Probe({ tick }: { tick: number }) {
      const innerRef = React.useRef<HTMLDivElement>(null)
      const composed = useComposedRefs(consumerRef, innerRef)
      return <div ref={composed} data-tick={tick} />
    }

    const { rerender } = render(<Probe tick={0} />)
    const callsAfterMount = consumerRef.mock.calls.length
    expect(callsAfterMount).toBeGreaterThan(0)

    rerender(<Probe tick={1} />)
    expect(consumerRef.mock.calls.length).toBe(callsAfterMount)
  })
})
