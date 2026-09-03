import PopoverRoot from './popover.svelte'
import { createHandle } from '../../internal/overlay-handle.svelte'

export const Popover = Object.assign(PopoverRoot, { createHandle })
export { default as PopoverTrigger } from './popover-trigger.svelte'
export { default as PopoverContent } from './popover-content.svelte'
export { default as PopoverTitle } from './popover-title.svelte'
export { default as PopoverDescription } from './popover-description.svelte'
export { default as PopoverClose } from './popover-close.svelte'
export type { OverlayHandle as PopoverHandle } from '../../internal/overlay-handle.svelte'
