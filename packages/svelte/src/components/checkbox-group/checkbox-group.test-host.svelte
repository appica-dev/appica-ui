<script lang="ts">
  import Checkbox from '../checkbox/checkbox.svelte'
  import CheckboxGroup from './checkbox-group.svelte'

  let {
    orientation,
    defaultValue,
    value,
    onValueChange,
    class: className,
    testId,
    matchByName = false,
  }: {
    orientation?: 'horizontal' | 'vertical'
    defaultValue?: string[]
    value?: string[]
    onValueChange?: (value: string[]) => void
    class?: string
    testId?: string
    matchByName?: boolean
  } = $props()
</script>

<CheckboxGroup
  aria-label="Toppings"
  {orientation}
  {defaultValue}
  {value}
  {onValueChange}
  class={className}
  data-testid={testId}
>
  {#if matchByName}
    <Checkbox name="cheese" aria-label="Cheese" />
    <Checkbox name="bacon" aria-label="Bacon" />
  {:else}
    <Checkbox value="cheese" aria-label="Cheese" />
    <Checkbox value="bacon" aria-label="Bacon" />
  {/if}
</CheckboxGroup>
