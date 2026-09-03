export { default as ReducedMotionProvider } from './reduced-motion-provider.svelte'
export { getReducedMotionContext } from './reduced-motion-context.svelte'
export type { ReducedMotionContextValue } from './reduced-motion-context.svelte'

export interface ReducedMotionProviderProps {
  /**
   * Force-disable animations regardless of the OS preference
   * @default false
   */
  disableAnimations?: boolean
}
