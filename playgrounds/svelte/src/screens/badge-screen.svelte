<script lang="ts">
  import { Badge } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Badge</h2>
  <div class="flex flex-wrap items-center gap-3">
    <Badge>Primary</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="outline">Outline</Badge>
    <Badge variant="error">Error</Badge>
    <Badge variant="success">Success</Badge>
    <Badge href="#badge">Link</Badge>
    <Badge onclick={() => {}}>Button</Badge>
  </div>
</section>
