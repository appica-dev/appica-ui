<script lang="ts">
  import { ScrollArea } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">ScrollArea</h2>
  <ScrollArea class="h-48 w-72 rounded-lg border" scrollShadow>
    {#each Array.from({ length: 24 }, (_, i) => i + 1) as n (n)}
      <p class="text-foreground-muted px-3 py-1.5 text-sm">Row {n}</p>
    {/each}
  </ScrollArea>
</section>
