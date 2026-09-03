<script lang="ts">
  import { Sparkline, SparklineChart, SparklineLabel, SparklineValue } from '@appica/ui-svelte'

  const data = [4, 8, 6, 10, 7, 12]
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Sparkline</h2>

  <Sparkline {data} {labels} class="max-w-xs">
    <div class="flex items-baseline justify-between">
      <SparklineLabel />
      <SparklineValue />
    </div>
    <SparklineChart variant="area" tooltip aria-label="Weekly revenue" />
  </Sparkline>

  <Sparkline {data} class="max-w-xs">
    <SparklineChart variant="column" height={64} aria-label="Weekly columns" />
  </Sparkline>
</section>
