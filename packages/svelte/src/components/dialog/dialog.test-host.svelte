<script lang="ts">
  import { buttonVariants } from '../button/button-variants'
  import type { OverlayHandle } from '../../internal/overlay-handle.svelte'
  import Dialog from './dialog.svelte'
  import DialogTrigger from './dialog-trigger.svelte'
  import DialogContent from './dialog-content.svelte'
  import DialogHeader from './dialog-header.svelte'
  import DialogTitle from './dialog-title.svelte'
  import DialogDescription from './dialog-description.svelte'
  import DialogBody from './dialog-body.svelte'
  import DialogFooter from './dialog-footer.svelte'
  import DialogClose from './dialog-close.svelte'

  let {
    title = 'Update profile',
    description = 'Make changes to your account.',
    closeButton,
    backdrop,
    frame,
    contentClass,
    handle,
  }: {
    title?: string
    description?: string
    closeButton?: boolean
    backdrop?: boolean
    frame?: boolean
    contentClass?: string
    handle?: OverlayHandle
  } = $props()
</script>

<Dialog {handle}>
  <DialogTrigger class={buttonVariants()}>Open dialog</DialogTrigger>
  <DialogContent class={contentClass} {closeButton} {backdrop} {frame}>
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
    <DialogBody>Body content</DialogBody>
    <DialogFooter>
      <DialogClose class={buttonVariants({ variant: 'outline' })}>Cancel</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
