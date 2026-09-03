import { cubicOut } from 'svelte/easing'
import type { TransitionConfig } from 'svelte/transition'
import type { DrawerSide } from './drawer-context'

export const DRAWER_ENTER_MS = 400
export const DRAWER_EXIT_MS = 300
export const DRAWER_OVERLAY_MS = 400

/**
 * CSS `cubic-bezier(x1, y1, x2, y2)` as a Svelte easing. Y is not clamped, so
 * React's enter curve (`y1 > 1`) can overshoot.
 */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by

  function sampleX(t: number) {
    return ((ax * t + bx) * t + cx) * t
  }
  function sampleY(t: number) {
    return ((ay * t + by) * t + cy) * t
  }
  function slopeX(t: number) {
    return (3 * ax * t + 2 * bx) * t + cx
  }

  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const slope = slopeX(t)
      if (Math.abs(slope) < 1e-6) break
      t -= (sampleX(t) - x) / slope
    }
    return sampleY(t)
  }
}

/** Matches React `ease-[cubic-bezier(0.32,1.2,0.4,1)]`. */
export const drawerEnterEasing = cubicBezier(0.32, 1.2, 0.4, 1)
export const drawerExitEasing = cubicOut

export type DrawerSlideParams = {
  side: DrawerSide
  duration: number
  easing: (t: number) => number
}

function offscreenDelta(node: Element, side: DrawerSide): { x: number; y: number } {
  const rect = node.getBoundingClientRect()
  const parent = node.parentElement
  const padStyle = parent ? getComputedStyle(parent) : null
  const width = rect.width || window.innerWidth
  const height = rect.height || window.innerHeight

  switch (side) {
    case 'bottom':
      return { x: 0, y: height + (padStyle ? parseFloat(padStyle.paddingBottom) || 0 : 8) }
    case 'top':
      return { x: 0, y: -(height + (padStyle ? parseFloat(padStyle.paddingTop) || 0 : 8)) }
    case 'left':
      return { x: -(width + (padStyle ? parseFloat(padStyle.paddingLeft) || 0 : 8)), y: 0 }
    case 'right':
      return { x: width + (padStyle ? parseFloat(padStyle.paddingRight) || 0 : 8), y: 0 }
    default: {
      const _exhaustive: never = side
      return _exhaustive
    }
  }
}

/**
 * Slide via `transform: translate3d(...)`. The independent CSS `translate` property
 * drops the Y component when Svelte's rest keyframe serializes as `0px` (one value),
 * which snaps bottom/right (positive axis) to rest while top/left keep interpolating.
 * `u` is 1 off-screen and 0 at rest.
 */
export function drawerSlide(node: Element, params: DrawerSlideParams): TransitionConfig {
  const { side, duration, easing } = params
  if (duration <= 0) return { duration: 0 }

  const { x, y } = offscreenDelta(node, side)
  return {
    duration,
    easing,
    css: (_t, u) => `transform: translate3d(${x * u}px, ${y * u}px, 0px)`,
  }
}
