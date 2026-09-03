<script lang="ts">
  import { Rating } from '@appica/ui-svelte'

  let score = $state(3)
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Rating</h2>
  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Interactive ({score})</p>
    <Rating aria-label="Score" bind:value={score} onValueChange={(next) => (score = next)} />
  </div>
  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Half step</p>
    <Rating aria-label="Half step" step={0.5} value={3.5} />
  </div>
  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Read only</p>
    <Rating readOnly value={4} />
  </div>
  <div class="flex flex-col gap-2" dir="rtl">
    <p class="text-foreground-muted text-sm">RTL</p>
    <Rating aria-label="RTL score" value={score} onValueChange={(next) => (score = next)} />
  </div>
</section>
