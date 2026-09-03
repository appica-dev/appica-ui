import { getDirectionContext, type Direction } from '../../providers/direction-provider/direction-context'

/**
 * Reading direction for the subtree. Defaults to `'ltr'` when no
 * `<DirectionProvider>` is mounted. Read `.current` in a template or
 * `$derived` to subscribe.
 */
export function useDirection() {
  const ctx = getDirectionContext()
  return {
    get current(): Direction {
      return ctx.dir
    },
  }
}
