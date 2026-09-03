import AlertDialogRoot from './alert-dialog.svelte'
import { createHandle } from '../../internal/overlay-handle.svelte'

export const AlertDialog = Object.assign(AlertDialogRoot, { createHandle })
export { default as AlertDialogTrigger } from './alert-dialog-trigger.svelte'
export { default as AlertDialogContent } from './alert-dialog-content.svelte'
export { default as AlertDialogHeader } from './alert-dialog-header.svelte'
export { default as AlertDialogTitle } from './alert-dialog-title.svelte'
export { default as AlertDialogDescription } from './alert-dialog-description.svelte'
export { default as AlertDialogBody } from './alert-dialog-body.svelte'
export { default as AlertDialogFooter } from './alert-dialog-footer.svelte'
export { default as AlertDialogClose } from './alert-dialog-close.svelte'
export type { OverlayHandle as AlertDialogHandle } from '../../internal/overlay-handle.svelte'
