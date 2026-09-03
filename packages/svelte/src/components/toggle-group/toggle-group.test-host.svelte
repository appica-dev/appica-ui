<script lang="ts">
  import Toggle from '../toggle/toggle.svelte'
  import ToggleGroup from './toggle-group.svelte'

  let {
    defaultValue,
    value,
    onValueChange,
    multiple,
    orientation,
    disabled,
    class: className,
  }: {
    defaultValue?: string | string[]
    value?: string | string[]
    onValueChange?: (value: string | string[]) => void
    multiple?: boolean
    orientation?: 'horizontal' | 'vertical'
    disabled?: boolean
    class?: string
  } = $props()
</script>

<ToggleGroup
  aria-label="Text alignment"
  {defaultValue}
  {value}
  {onValueChange}
  {multiple}
  {orientation}
  {disabled}
  class={className}
>
  <Toggle value="left" aria-label="Left">L</Toggle>
  <Toggle value="center" aria-label="Center">C</Toggle>
  <Toggle value="right" aria-label="Right">R</Toggle>
</ToggleGroup>
