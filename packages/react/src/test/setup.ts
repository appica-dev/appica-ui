import '@testing-library/jest-dom/vitest'
import { afterEach, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from 'vitest-axe/matchers'

expect.extend(matchers)

// jsdom doesn't implement window.matchMedia - stub it so hooks that read
// media preferences (e.g. useReducedMotion) work in tests. Default to
// "no match" so animations stay enabled; individual tests can override.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

// jsdom matches :focus-visible on any focus. Browsers skip focus that follows a pointer press, and
// Carousel's keyboard-only autoplay pause relies on that, so track the input modality the same way.
let pointerModality = false
document.addEventListener('keydown', () => (pointerModality = false), true)
document.addEventListener('pointerdown', () => (pointerModality = true), true)
document.addEventListener('mousedown', () => (pointerModality = true), true)
const nativeMatches = Element.prototype.matches
Element.prototype.matches = function (this: Element, selectors: string) {
  if (selectors === ':focus-visible') return !pointerModality && nativeMatches.call(this, ':focus')
  return nativeMatches.call(this, selectors)
} as typeof Element.prototype.matches

afterEach(() => {
  cleanup()
  pointerModality = false
})
