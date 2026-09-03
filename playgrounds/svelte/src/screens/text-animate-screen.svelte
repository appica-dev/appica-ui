<script lang="ts">
  import { TextAnimate } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">TextAnimate</h2>
  <p class="text-2xl font-semibold">
    <TextAnimate text="Typewriter preset" effect="typewriter" />
  </p>
  <p class="text-2xl font-semibold">
    <TextAnimate text="Shimmer loading" effect="shimmer" />
  </p>
  <p class="text-2xl font-semibold">
    <TextAnimate text="Wave motion" effect="wave" />
  </p>
</section>
