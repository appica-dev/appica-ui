import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import * as React from 'react'

// Custom theme keys must be registered, or `ease-linear` would sit beside `ease-spring` instead of replacing it.
const twMerge = extendTailwindMerge({ extend: { theme: { ease: ['spring'] } } })

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type PossibleRef<T> = React.Ref<T> | undefined

function setRef<T>(ref: PossibleRef<T>, value: T): (() => void) | void {
  if (typeof ref === 'function') {
    return ref(value) as (() => void) | void
  } else if (ref != null) {
    ;(ref as React.RefObject<T>).current = value
  }
}

export function composeRefs<T>(...refs: PossibleRef<T>[]) {
  return (node: T): void | (() => void) => {
    let hasCleanup = false
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node)
      if (!hasCleanup && typeof cleanup === 'function') {
        hasCleanup = true
      }
      return cleanup
    })

    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i]
          if (typeof cleanup === 'function') {
            cleanup()
          } else {
            setRef(refs[i], null as T)
          }
        }
      }
    }

    return undefined
  }
}

export function useComposedRefs<T>(...refs: PossibleRef<T>[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(composeRefs(...refs), refs)
}

export function focusableProps(disabled = false) {
  if (disabled) {
    return { tabIndex: -1, 'aria-disabled': true, 'data-disabled': '' } as const
  }
  return { tabIndex: 0 } as const
}
