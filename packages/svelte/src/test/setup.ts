import '@testing-library/jest-dom/vitest'
import { afterEach, expect } from 'vitest'
import { cleanup } from '@testing-library/svelte'
import * as matchers from 'vitest-axe/matchers'

expect.extend(matchers)

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

if (typeof Element !== 'undefined' && typeof Element.prototype.animate !== 'function') {
  Element.prototype.animate = function animate() {
    const animation: Pick<
      Animation,
      'finished' | 'cancel' | 'finish' | 'play' | 'addEventListener' | 'removeEventListener' | 'playState' | 'currentTime'
    > & {
      onfinish: ((this: Animation, ev: AnimationPlaybackEvent) => void) | null
    } = {
      playState: 'finished',
      currentTime: 0,
      finished: Promise.resolve({} as Animation),
      onfinish: null,
      cancel() {},
      finish() {
        this.playState = 'finished'
      },
      play() {
        this.playState = 'running'
      },
      addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
        if (type === 'finish') {
          queueMicrotask(() => {
            const fn = typeof listener === 'function' ? listener : listener.handleEvent
            fn.call(this, new Event('finish'))
          })
        }
      },
      removeEventListener() {},
    }
    queueMicrotask(() => {
      animation.onfinish?.call(animation as unknown as Animation, new Event('finish') as AnimationPlaybackEvent)
    })
    return animation as unknown as Animation
  }
}

if (typeof Element !== 'undefined' && typeof Element.prototype.hasPointerCapture !== 'function') {
  Element.prototype.hasPointerCapture = function hasPointerCapture() {
    return false
  }
  Element.prototype.setPointerCapture = function setPointerCapture() {}
  Element.prototype.releasePointerCapture = function releasePointerCapture() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

if (typeof Document !== 'undefined' && typeof Document.prototype.elementFromPoint !== 'function') {
  Document.prototype.elementFromPoint = function elementFromPoint() {
    return null
  }
}

afterEach(() => {
  cleanup()
})
