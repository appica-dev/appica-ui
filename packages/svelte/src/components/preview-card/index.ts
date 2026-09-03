import PreviewCardRoot from './preview-card.svelte'
import { createHandle } from '../../internal/overlay-handle.svelte'

export const PreviewCard = Object.assign(PreviewCardRoot, { createHandle })
export { default as PreviewCardTrigger } from './preview-card-trigger.svelte'
export { default as PreviewCardContent } from './preview-card-content.svelte'
export type { OverlayHandle as PreviewCardHandle } from '../../internal/overlay-handle.svelte'
