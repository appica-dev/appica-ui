<script lang="ts">
  import Countdown from './countdown.svelte'
  import CountdownSegment from './countdown-segment.svelte'

  let {
    targetDate,
    duration,
    interval,
    onComplete,
    class: className,
    ariaLabel,
    units = ['days', 'hours', 'minutes', 'seconds'],
  }: {
    targetDate?: Date | number | string
    duration?: number
    interval?: number
    onComplete?: () => void
    class?: string
    ariaLabel?: string
    units?: Array<'days' | 'hours' | 'minutes' | 'seconds'>
  } = $props()
</script>

<Countdown {targetDate} {duration} {interval} {onComplete} class={className} aria-label={ariaLabel}>
  {#each units as unit (unit)}
    <CountdownSegment {unit} />
  {/each}
</Countdown>
