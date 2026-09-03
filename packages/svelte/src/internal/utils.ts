import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function focusableProps(disabled = false) {
  if (disabled) {
    return { tabIndex: -1, 'aria-disabled': true, 'data-disabled': '' } as const
  }
  return { tabIndex: 0 } as const
}

export function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
  setter?.call(element, value)
  element.dispatchEvent(new Event('input', { bubbles: true }))
}

/** Bridge standalone `aria-invalid` to `data-invalid` for error styling. Spread after rest props. */
export function invalidDataAttr(ariaInvalid: unknown): { 'data-invalid': '' } | Record<string, never> {
  const invalid = ariaInvalid === true || ariaInvalid === 'true'
  return invalid ? { 'data-invalid': '' } : {}
}

/**
 * Spread consumer HTML rest onto a bits-ui primitive. Svelte's HTML attribute
 * types allow `null`; bits-ui's `Without<>` types do not, and the combined
 * union is too large for TypeScript to represent.
 */
export function asBitsAttrs(rest: object): Record<string, never> {
  return rest as Record<string, never>
}

/**
 * Commit a bits-ui bindable. `inner` is always defined so we never `bind:` undefined
 * (bits-ui defaults like `open = $bindable(false)` reject that). React-style controlled
 * props (`value` + `onChange`, parent does not update) revert `inner` to the locked value.
 */
export function commitBindableChange<T>(opts: {
  next: T
  bound: T | undefined
  setBound: (value: T) => void
  setInner: (value: T) => void
  onChange?: (value: T) => void
}) {
  const { next, bound, setBound, setInner, onChange } = opts
  if (bound === undefined) {
    setInner(next)
    onChange?.(next)
    return
  }
  if (!onChange) {
    setBound(next)
    setInner(next)
    return
  }
  onChange(next)
  setInner(bound)
}
