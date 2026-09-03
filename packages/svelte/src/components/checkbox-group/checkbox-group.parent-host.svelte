<script lang="ts">
  import Checkbox from '../checkbox/checkbox.svelte'
  import CheckboxGroup from './checkbox-group.svelte'

  const allValues = ['read', 'write', 'delete']

  let {
    defaultValue = ['read'],
    value,
    onValueChange,
  }: {
    defaultValue?: string[]
    value?: string[]
    onValueChange?: (next: string[]) => void
  } = $props()
</script>

<CheckboxGroup aria-label="Permissions" {allValues} {defaultValue} {value} {onValueChange}>
  <Checkbox parent aria-label="All" />
  <Checkbox name="read" aria-label="Read" />
  <Checkbox name="write" aria-label="Write" />
  <Checkbox name="delete" aria-label="Delete" />
</CheckboxGroup>
