<script lang="ts">
  import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Preview card</h2>

  <div class="flex flex-wrap items-center gap-6">
    <PreviewCard>
      <PreviewCardTrigger href="https://example.com" class="text-primary underline-offset-4 hover:underline">
        example.com
      </PreviewCardTrigger>
      <PreviewCardContent>
        <p class="text-foreground-emphasis font-medium">Example</p>
        <p class="text-foreground-subtle text-sm">A short preview of the linked page.</p>
      </PreviewCardContent>
    </PreviewCard>

    <PreviewCard>
      <PreviewCardTrigger href="https://example.com" class="text-primary underline-offset-4 hover:underline">
        No arrow
      </PreviewCardTrigger>
      <PreviewCardContent arrow={false}>
        <p class="text-foreground-subtle text-sm">No pointer on this one.</p>
      </PreviewCardContent>
    </PreviewCard>
  </div>
</section>
