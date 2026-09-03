<script lang="ts">
  import { Textarea } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Textarea</h2>
  <Textarea aria-label="Notes" placeholder="Write a note…" class="max-w-md" />
  <Textarea clearable rows={4} placeholder="Clearable" class="max-w-md" />
</section>
