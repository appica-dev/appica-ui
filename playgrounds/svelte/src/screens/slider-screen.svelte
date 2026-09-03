<script lang="ts">
  import { Slider } from '@appica/ui-svelte'

  let volume = $state(40)
  let range = $state([20, 80])
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Slider</h2>

  <div class="flex max-w-xs flex-col gap-2">
    <p class="text-foreground-muted text-sm">Volume ({volume})</p>
    <Slider bind:value={volume} thumbAriaLabel="Volume" />
  </div>

  <div class="flex max-w-xs flex-col gap-2">
    <p class="text-foreground-muted text-sm">Range ({range[0]}-{range[1]})</p>
    <Slider bind:value={range} tooltipVisibility="always" thumbAriaLabel={(i) => (i === 0 ? 'Min' : 'Max')} />
  </div>

  <div class="flex max-w-xs flex-col gap-2">
    <p class="text-foreground-muted text-sm">No tooltip</p>
    <Slider defaultValue={50} tooltipVisibility="never" thumbAriaLabel="Level" />
  </div>

  <div class="flex max-w-xs flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled</p>
    <Slider defaultValue={30} disabled thumbAriaLabel="Disabled volume" />
  </div>

  <div class="flex h-40 flex-col gap-2">
    <p class="text-foreground-muted text-sm">Vertical</p>
    <Slider orientation="vertical" defaultValue={60} thumbAriaLabel="Gain" />
  </div>
</section>
