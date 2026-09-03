<script lang="ts">
  import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    buttonVariants,
  } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Dialog</h2>

  <div class="flex flex-wrap gap-3">
    <Dialog>
      <DialogTrigger class={buttonVariants({ variant: 'outline' })}>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update profile</DialogTitle>
          <DialogDescription>Make changes to your account.</DialogDescription>
        </DialogHeader>
        <DialogBody>Body content stays inside the framed popup.</DialogBody>
        <DialogFooter>
          <DialogClose class={buttonVariants({ variant: 'outline' })}>Cancel</DialogClose>
          <DialogClose class={buttonVariants()}>Save</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog>
      <DialogTrigger class={buttonVariants({ variant: 'outline' })}>No backdrop</DialogTrigger>
      <DialogContent backdrop={false}>
        <DialogHeader>
          <DialogTitle>Plain card</DialogTitle>
          <DialogDescription>Frame drops when the backdrop is off.</DialogDescription>
        </DialogHeader>
        <DialogBody>Still labeled as a dialog.</DialogBody>
      </DialogContent>
    </Dialog>
  </div>
</section>
