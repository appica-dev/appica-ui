export { default as DirectionProvider } from './direction-provider.svelte'
export { getDirectionContext } from './direction-context'
export type { Direction, DirectionContextValue } from './direction-context'

export interface DirectionProviderProps {
  /**
   * Reading direction for descendant components.
   * @default 'ltr'
   */
  dir?: import('./direction-context').Direction
}
