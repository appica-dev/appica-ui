<script lang="ts">
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, buttonVariants } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Tooltip</h2>

  <TooltipProvider delay={200}>
    <div class="flex flex-wrap items-center gap-3">
      <Tooltip>
        <TooltipTrigger class={buttonVariants({ variant: 'outline' })}>Hover</TooltipTrigger>
        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger class={buttonVariants({ variant: 'outline' })}>No arrow</TooltipTrigger>
        <TooltipContent arrow={false}>Plain tooltip</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger class={buttonVariants({ variant: 'ghost', size: 'sm' })}>Bottom</TooltipTrigger>
        <TooltipContent side="bottom">Opens below</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
</section>
