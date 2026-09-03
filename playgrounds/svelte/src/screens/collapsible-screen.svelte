<script lang="ts">
  import { Collapsible, CollapsibleContent, CollapsibleTrigger, buttonVariants } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Collapsible</h2>

  <Collapsible>
    <CollapsibleTrigger class={buttonVariants({ variant: 'outline' })}>Toggle</CollapsibleTrigger>
    <CollapsibleContent>
      <p class="text-foreground-muted mt-2 text-sm">Hidden until you open the panel.</p>
    </CollapsibleContent>
  </Collapsible>

  <Collapsible defaultOpen>
    <CollapsibleTrigger class={buttonVariants({ variant: 'outline' })}>Open by default</CollapsibleTrigger>
    <CollapsibleContent>
      <p class="text-foreground-muted mt-2 text-sm">This panel starts expanded.</p>
    </CollapsibleContent>
  </Collapsible>
</section>
