<script lang="ts">
  import { buttonVariants } from '../button/button-variants'
  import type { OverlayHandle } from '../../internal/overlay-handle.svelte'
  import AlertDialog from './alert-dialog.svelte'
  import AlertDialogTrigger from './alert-dialog-trigger.svelte'
  import AlertDialogContent from './alert-dialog-content.svelte'
  import AlertDialogHeader from './alert-dialog-header.svelte'
  import AlertDialogTitle from './alert-dialog-title.svelte'
  import AlertDialogDescription from './alert-dialog-description.svelte'
  import AlertDialogBody from './alert-dialog-body.svelte'
  import AlertDialogFooter from './alert-dialog-footer.svelte'
  import AlertDialogClose from './alert-dialog-close.svelte'

  let {
    handle,
  }: {
    handle?: OverlayHandle
  } = $props()
</script>

<AlertDialog {handle}>
  <AlertDialogTrigger class={buttonVariants({ variant: 'destructive' })}>Delete</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete project</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogBody>Everything in this project will be removed.</AlertDialogBody>
    <AlertDialogFooter>
      <AlertDialogClose class={buttonVariants({ variant: 'outline' })}>Cancel</AlertDialogClose>
      <AlertDialogClose class={buttonVariants({ variant: 'destructive' })}>Confirm</AlertDialogClose>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
