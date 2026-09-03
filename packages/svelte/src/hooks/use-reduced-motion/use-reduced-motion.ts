import { useMediaQuery } from '../use-media-query/use-media-query'
import { getReducedMotionContext } from '../../providers/reduced-motion-provider/reduced-motion-context.svelte'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Returns whether animations should be skipped - either because the OS
 * exposes `prefers-reduced-motion: reduce` or because a parent
 * `<ReducedMotionProvider disableAnimations>` opted out globally.
 *
 * Read `.current` in a template or `$derived` to subscribe.
 */
export function useReducedMotion() {
  const osPrefersReduced = useMediaQuery(QUERY)
  const ctx = getReducedMotionContext()
  return {
    get current() {
      return ctx.disableAnimations || osPrefersReduced.current
    },
  }
}
