<script lang="ts">
  import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogClose,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    buttonVariants,
  } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Alert dialog</h2>

  <AlertDialog>
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
</section>
