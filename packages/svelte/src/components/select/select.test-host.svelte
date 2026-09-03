<script lang="ts">
  import Field from '../field/field.svelte'
  import FieldLabel from '../field/field-label.svelte'
  import Select from './select.svelte'
  import SelectTrigger from './select-trigger.svelte'
  import SelectValue from './select-value.svelte'
  import SelectContent from './select-content.svelte'
  import SelectGroup from './select-group.svelte'
  import SelectGroupLabel from './select-group-label.svelte'
  import SelectItem from './select-item.svelte'
  import SelectSeparator from './select-separator.svelte'

  let {
    defaultValue,
    clearable,
    multiple,
    invalid,
    placeholder = 'Pick a fruit',
  }: {
    defaultValue?: string | string[]
    clearable?: boolean
    multiple?: boolean
    invalid?: boolean
    placeholder?: string
  } = $props()
</script>

{#if invalid}
  <Field {invalid}>
    <FieldLabel>Fruit</FieldLabel>
    <Select {defaultValue} {multiple}>
      <SelectTrigger {clearable} aria-label={placeholder}>
        <SelectValue {placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>Citrus</SelectGroupLabel>
          <SelectItem value="orange" label="Orange">Orange</SelectItem>
          <SelectItem value="lemon" label="Lemon">Lemon</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Berries</SelectGroupLabel>
          <SelectItem value="strawberry" label="Strawberry">Strawberry</SelectItem>
          <SelectItem value="blueberry" label="Blueberry" disabled>Blueberry</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </Field>
{:else}
  <Select {defaultValue} {multiple}>
    <SelectTrigger {clearable} aria-label={placeholder}>
      <SelectValue {placeholder} />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectGroupLabel>Citrus</SelectGroupLabel>
        <SelectItem value="orange" label="Orange">Orange</SelectItem>
        <SelectItem value="lemon" label="Lemon">Lemon</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectGroupLabel>Berries</SelectGroupLabel>
        <SelectItem value="strawberry" label="Strawberry">Strawberry</SelectItem>
        <SelectItem value="blueberry" label="Blueberry" disabled>Blueberry</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
{/if}
