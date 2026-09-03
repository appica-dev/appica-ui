<script lang="ts">
  import { Input } from '@appica/ui-svelte'

  let value = $state('')
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Input</h2>
  <Input placeholder="Type something…" class="max-w-xs" bind:value />
  <Input clearable placeholder="Clearable" class="max-w-xs" />
  <Input variant="soft" inputSize="lg" placeholder="Soft large" class="max-w-xs" />
</section>
