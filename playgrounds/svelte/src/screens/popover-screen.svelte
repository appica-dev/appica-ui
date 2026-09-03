<script lang="ts">
  import {
    Popover,
    PopoverClose,
    PopoverContent,
    PopoverDescription,
    PopoverTitle,
    PopoverTrigger,
    buttonVariants,
  } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Popover</h2>

  <div class="flex flex-wrap items-center gap-3">
    <Popover>
      <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>Open</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Notifications</PopoverTitle>
        <PopoverDescription>You are all caught up.</PopoverDescription>
        <PopoverClose class={buttonVariants({ variant: 'primary', size: 'sm' })}>Dismiss</PopoverClose>
      </PopoverContent>
    </Popover>

    <Popover>
      <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>No arrow</PopoverTrigger>
      <PopoverContent arrow={false}>
        <PopoverTitle>Plain</PopoverTitle>
        <PopoverDescription>No pointer on this one.</PopoverDescription>
      </PopoverContent>
    </Popover>
  </div>
</section>
