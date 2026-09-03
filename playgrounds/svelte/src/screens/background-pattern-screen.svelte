<script lang="ts">
  import { BackgroundPattern } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">BackgroundPattern</h2>
  <BackgroundPattern variant="dots" class="rounded-xl p-8">
    <p class="text-foreground-emphasis relative">Dots</p>
  </BackgroundPattern>
  <BackgroundPattern variant="grid" class="rounded-xl p-8">
    <p class="text-foreground-emphasis relative">Grid</p>
  </BackgroundPattern>
  <BackgroundPattern variant="hexagons" spotlight class="min-h-40 rounded-xl p-8">
    <p class="text-foreground-emphasis relative">Hexagons with spotlight - move the pointer</p>
  </BackgroundPattern>
</section>
