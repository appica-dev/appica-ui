<script lang="ts">
  import { BorderBeam, Card } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">BorderBeam</h2>
  <BorderBeam class="p-1">
    <Card class="p-6">
      <p class="text-foreground-emphasis font-medium">Always-on beam</p>
      <p class="text-foreground-muted mt-1 text-sm">The comet runs around this card.</p>
    </Card>
  </BorderBeam>
  <BorderBeam revealOn="hover" class="p-1">
    <Card class="p-6">
      <p class="text-foreground-emphasis font-medium">Hover to reveal</p>
    </Card>
  </BorderBeam>
</section>
