<script lang="ts">
  import Radio from './radio.svelte'
  import RadioGroup from '../radio-group/radio-group.svelte'

  let {
    defaultValue,
    value,
    onValueChange,
    invalid,
    disabled,
    class: className,
  }: {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
    invalid?: boolean
    disabled?: boolean
    class?: string
  } = $props()
</script>

<RadioGroup {defaultValue} {value} {onValueChange}>
  <Radio value="a" aria-label={invalid ? 'Invalid' : 'Option A'} aria-invalid={invalid} {disabled} class={className} />
  <Radio value="b" aria-label="Option B" />
</RadioGroup>
