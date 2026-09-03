<script lang="ts">
  import Radio from '../radio/radio.svelte'
  import RadioGroup from './radio-group.svelte'

  let {
    orientation,
    onValueChange,
    class: className,
    testId,
  }: {
    orientation?: 'horizontal' | 'vertical'
    onValueChange?: (value: string) => void
    class?: string
    testId?: string
  } = $props()
</script>

<RadioGroup aria-label="Channel" {orientation} {onValueChange} class={className} data-testid={testId}>
  <Radio value="email" aria-label="Email" />
  <Radio value="sms" aria-label="SMS" />
</RadioGroup>
