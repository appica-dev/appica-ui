import DialogRoot from './dialog.svelte'
import { createHandle } from '../../internal/overlay-handle.svelte'

export const Dialog = Object.assign(DialogRoot, { createHandle })
export { default as DialogTrigger } from './dialog-trigger.svelte'
export { default as DialogContent } from './dialog-content.svelte'
export { default as DialogHeader } from './dialog-header.svelte'
export { default as DialogTitle } from './dialog-title.svelte'
export { default as DialogDescription } from './dialog-description.svelte'
export { default as DialogBody } from './dialog-body.svelte'
export { default as DialogFooter } from './dialog-footer.svelte'
export { default as DialogClose } from './dialog-close.svelte'
export type { OverlayHandle as DialogHandle } from '../../internal/overlay-handle.svelte'
